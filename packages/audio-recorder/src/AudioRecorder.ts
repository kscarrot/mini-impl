import type {
  RecorderEventHandler,
  RecorderEventMap,
  RecorderOptions,
  RecorderResult,
  ResolvedRecorderOptions,
} from './types'
import { createWorkletBlobURL } from './audio-processing'
import { RecorderError } from './errors'
import {
  RecorderErrorCode,
  RecorderEvent,
  RecorderState,
} from './types'
import { computeDurationMs, encodeWAV } from './wav'

const DEFAULTS: ResolvedRecorderOptions = {
  targetSampleRate: 16000,
  batchDurationMs: 200,
  audioConstraints: {},
}

export class AudioRecorder {
  get state(): RecorderState {
    return this.#state
  }

  #state: RecorderState = RecorderState.Idle
  #options: ResolvedRecorderOptions
  #listeners = new Map<RecorderEvent, Set<RecorderEventHandler<any>>>()

  #stream: MediaStream | null = null
  #audioContext: AudioContext | null = null
  #sourceNode: MediaStreamAudioSourceNode | null = null
  #workletNode: AudioWorkletNode | null = null
  #workletURL: string | null = null

  #chunks: ArrayBuffer[] = []

  constructor(options?: RecorderOptions) {
    this.#options = { ...DEFAULTS, ...options }
  }

  on<K extends RecorderEvent>(event: K, handler: RecorderEventHandler<K>): this {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set())
    }
    this.#listeners.get(event)!.add(handler)
    return this
  }

  off<K extends RecorderEvent>(event: K, handler: RecorderEventHandler<K>): this {
    this.#listeners.get(event)?.delete(handler)
    return this
  }

  #emit<K extends RecorderEvent>(event: K, payload: RecorderEventMap[K]): void {
    const handlers = this.#listeners.get(event)
    if (!handlers)
      return
    for (const handler of handlers) {
      try {
        handler(payload)
      }
      catch (err) {
        console.error(`[AudioRecorder] 事件处理器 "${event}" 抛出异常:`, err)
      }
    }
  }

  #transition(to: RecorderState): void {
    this.#state = to
    this.#emit(RecorderEvent.StateChange, to)
  }

  #assertState(...allowed: RecorderState[]): void {
    if (!allowed.includes(this.#state)) {
      throw new RecorderError(
        RecorderErrorCode.InvalidState,
        `当前状态 "${this.#state}" 不允许此操作。允许的状态: ${allowed.join(', ')}`,
      )
    }
  }

  async start(): Promise<void> {
    this.#assertState(RecorderState.Idle, RecorderState.Stopped, RecorderState.Error)
    this.#transition(RecorderState.Requesting)
    this.#chunks = []

    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({
        audio: { ...this.#options.audioConstraints },
        video: false,
      })

      this.#audioContext = new AudioContext()
      await this.#audioContext.resume()
      const nativeSampleRate = this.#audioContext.sampleRate

      /** 从源码构建 AudioWorklet */
      this.#workletURL = createWorkletBlobURL(
        nativeSampleRate,
        this.#options.targetSampleRate,
        this.#options.batchDurationMs,
      )

      /** 加载 AudioWorklet */
      try {
        await this.#audioContext.audioWorklet.addModule(this.#workletURL!)
      }
      catch (err) {
        throw new RecorderError(
          RecorderErrorCode.WorkletLoadFailed,
          'AudioWorklet 模块加载失败。',
          err,
        )
      }

      /** 从媒体流创建音频源节点 */
      this.#sourceNode = this.#audioContext.createMediaStreamSource(this.#stream)

      /** 创建 AudioWorklet 节点 */
      this.#workletNode = new AudioWorkletNode(
        this.#audioContext,
        'recorder-processor',
        { channelCount: 1 },
      )

      /** worketNode节点写到#chunks */
      this.#workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        this.#chunks.push(e.data)
        this.#emit(RecorderEvent.DataAvailable, e.data)
      }

      this.#workletNode.onprocessorerror = () => {
        this.#handleError(
          new RecorderError(RecorderErrorCode.Unknown, 'AudioWorklet 处理器运行时错误。'),
        )
      }

      this.#sourceNode.connect(this.#workletNode)
      this.#workletNode.connect(this.#audioContext.destination)
      this.#transition(RecorderState.Recording)
    }
    catch (err) {
      this.#handleError(err)
    }
  }

  async stop(): Promise<RecorderResult> {
    this.#assertState(RecorderState.Recording)
    this.#transition(RecorderState.Stopping)

    const { promise, resolve } = Promise.withResolvers<void>()
    if (this.#workletNode) {
      const originalHandler = this.#workletNode.port.onmessage
      this.#workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        this.#chunks.push(e.data)
        this.#emit(RecorderEvent.DataAvailable, e.data)
      }

      this.#workletNode.port.postMessage('stop')

      setTimeout(() => {
        this.#workletNode!.port.onmessage = originalHandler
        resolve()
      }, 100)
    }
    else {
      resolve()
    }
    await promise

    this.#teardown()

    const blob = encodeWAV(this.#chunks, this.#options.targetSampleRate)
    const url = URL.createObjectURL(blob)
    const totalBytes = this.#chunks.reduce((sum, buf) => sum + buf.byteLength, 0)
    const durationMs = computeDurationMs(totalBytes, this.#options.targetSampleRate)

    const result: RecorderResult = { blob, url, durationMs }

    this.#transition(RecorderState.Stopped)
    this.#emit(RecorderEvent.Result, result)
    return result
  }

  destroy(): void {
    this.#teardown()
    this.#chunks = []
    this.#listeners.clear()
    this.#state = RecorderState.Idle
  }

  #teardown(): void {
    if (this.#workletNode) {
      this.#workletNode.port.onmessage = null
      this.#workletNode.onprocessorerror = null
      this.#workletNode.port.close()
      this.#workletNode.disconnect()
      this.#workletNode = null
    }

    if (this.#sourceNode) {
      this.#sourceNode.disconnect()
      this.#sourceNode = null
    }

    if (this.#audioContext) {
      this.#audioContext.close().catch(() => { })
      this.#audioContext = null
    }

    if (this.#stream) {
      this.#stream.getTracks().forEach(track => track.stop())
      this.#stream = null
    }

    if (this.#workletURL) {
      URL.revokeObjectURL(this.#workletURL)
      this.#workletURL = null
    }
  }

  #handleError(err: unknown): never {
    this.#teardown()

    const recorderErr
      = err instanceof DOMException
        ? RecorderError.fromDOMException(err)
        : err instanceof RecorderError
          ? err
          : new RecorderError(RecorderErrorCode.Unknown, String(err), err)

    this.#transition(RecorderState.Error)
    this.#emit(RecorderEvent.Error, recorderErr)
    throw recorderErr
  }
}
