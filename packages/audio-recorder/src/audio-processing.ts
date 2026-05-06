/**
 * 音频处理核心模块
 *
 * 包含三个职责：
 * 1. 原始 DSP 函数（从腾讯云语音 SDK 移植）：to16kHz, to16BitPCM
 * 2. AudioWorklet 处理器源码生成
 * 3. Blob URL 工厂
 */

// ─── 1. 降采样：线性插值算法（保留原始逻辑） ─────────────────────────

/**
 * 将任意采样率的音频数据通过线性插值降采样到 16kHz
 */
export function to16kHz(audioData: ArrayLike<number>, sampleRate = 44100): Float32Array {
  const data = new Float32Array(audioData as unknown as ArrayBuffer)
  const fitCount = Math.round(data.length * (16000 / sampleRate))
  const newData = new Float32Array(fitCount)
  const springFactor = (data.length - 1) / (fitCount - 1)
  newData[0] = data[0]
  for (let i = 1; i < fitCount - 1; i++) {
    const tmp = i * springFactor
    const before: any = Math.floor(tmp).toFixed()
    const after: any = Math.ceil(tmp).toFixed()
    const atPoint = tmp - before
    newData[i] = data[before] + (data[after] - data[before]) * atPoint
  }
  newData[fitCount - 1] = data[data.length - 1]
  return newData
}

// ─── 2. PCM 格式转换（保留原始逻辑） ────────────────────────────────

/**
 * 将 Float32 音频数据转换为 16-bit 有符号整数 PCM（小端序）
 */
export function to16BitPCM(input: Float32Array): DataView {
  const dataLength = input.length * (16 / 8)
  const dataBuffer = new ArrayBuffer(dataLength)
  const dataView = new DataView(dataBuffer)
  let offset = 0
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
  return dataView
}

// ─── 3. AudioWorklet 处理器源码生成 ─────────────────────────────────

export function buildWorkletSource(
  nativeSampleRate: number,
  targetSampleRate: number,
  batchDurationMs: number,
): string {
  const batchSizeBytes = Math.floor(targetSampleRate * (batchDurationMs / 1000)) * 2

  return `
// ── 注入的 DSP 函数（在音频线程内执行） ──
const to16kHz = ${to16kHz.toString()};
const to16BitPCM = ${to16BitPCM.toString()};

class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = new Int8Array(0);
    this._batchSizeBytes = ${batchSizeBytes};
    this._nativeSampleRate = ${nativeSampleRate};
    this._stopped = false;

    this.port.onmessage = (e) => {
      if (e.data === 'stop') {
        // flush 剩余数据
        if (this._buffer.length > 0) {
          this.port.postMessage(this._buffer.buffer);
          this._buffer = new Int8Array(0);
        }
        this._stopped = true;
      }
    };
  }

  process(inputs) {
    if (this._stopped) return false;

    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const channelData = input[0]; // 单声道

    // 降采样 → PCM 转换
    const resampled = to16kHz(channelData, this._nativeSampleRate);
    const pcm = to16BitPCM(resampled);
    const chunk = new Int8Array(pcm.buffer);

    // 追加到内部缓冲区
    const merged = new Int8Array(this._buffer.length + chunk.length);
    merged.set(this._buffer, 0);
    merged.set(chunk, this._buffer.length);
    this._buffer = merged;

    // 达到批量阈值时发送
    if (this._buffer.length >= this._batchSizeBytes) {
      this.port.postMessage(this._buffer.buffer);
      this._buffer = new Int8Array(0);
    }

    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
`
}

// ─── 4. Blob URL 工厂 ───────────────────────────────────────────────

/**
 * 将 AudioWorklet 处理器源码转为可加载的 Blob URL
 */
export function createWorkletBlobURL(
  nativeSampleRate: number,
  targetSampleRate: number,
  batchDurationMs: number,
): string {
  const source = buildWorkletSource(nativeSampleRate, targetSampleRate, batchDurationMs)
  const blob = new Blob([source], { type: 'application/javascript' })
  return URL.createObjectURL(blob)
}
