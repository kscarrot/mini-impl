import type { RecorderOptions, RecorderResult } from '@mini-impl/audio-recorder'
import {
  AudioRecorder,
  RecorderEvent,
  RecorderState,
} from '@mini-impl/audio-recorder'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseAudioRecorderReturn {
  state: RecorderState
  result: RecorderResult | null
  error: string | null
  elapsedMs: number
  start: () => Promise<void>
  stop: () => Promise<RecorderResult | undefined>
  reset: () => void
}

export function useAudioRecorder(
  options?: RecorderOptions,
): UseAudioRecorderReturn {
  const recorderRef = useRef<AudioRecorder | null>(null)
  const optionsRef = useRef(options)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const [state, setState] = useState<RecorderState>(RecorderState.Idle)
  const [result, setResult] = useState<RecorderResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    const recorder = new AudioRecorder(optionsRef.current)
    recorderRef.current = recorder

    recorder.on(RecorderEvent.StateChange, (s) => {
      setState(s)
    })

    recorder.on(RecorderEvent.Error, (err) => {
      setError(err.message)
    })

    return () => {
      recorder.destroy()
      if (timerRef.current)
        clearInterval(timerRef.current)
    }
  }, [])

  /* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect -- 录音计时与 state 同步 */
  useEffect(() => {
    if (state === RecorderState.Recording) {
      startTimeRef.current = Date.now()
      setElapsedMs(0)
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current)
      }, 100)
    }
    else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (
        state === RecorderState.Stopped
        && startTimeRef.current > 0
      ) {
        setElapsedMs(Date.now() - startTimeRef.current)
      }
    }
  }, [state])

  const start = useCallback(async () => {
    setError(null)
    setResult(null)
    setElapsedMs(0)
    try {
      await recorderRef.current?.start()
    }
    catch {
      // 错误已通过事件处理
    }
  }, [])

  const stop = useCallback(async () => {
    try {
      const res = await recorderRef.current?.stop()
      if (res)
        setResult(res)
      return res
    }
    catch {
      return undefined
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setElapsedMs(0)
  }, [])

  return { state, result, error, elapsedMs, start, stop, reset }
}
