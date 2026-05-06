/**
 * WAV 文件组装模块
 */

/**
 * 将 PCM 数据块数组组装为 WAV Blob
 */
export function encodeWAV(pcmChunks: ArrayBuffer[], sampleRate = 16000): Blob {
  const dataLength = pcmChunks.reduce((sum, buf) => sum + buf.byteLength, 0)

  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const headerSize = 44

  const header = new ArrayBuffer(headerSize)
  const view = new DataView(header)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')

  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)

  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  return new Blob([header, ...pcmChunks], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

/**
 * 根据 PCM 数据总字节数计算录音时长（毫秒）
 */
export function computeDurationMs(
  totalBytes: number,
  sampleRate: number,
  bytesPerSample = 2,
  channels = 1,
): number {
  const totalSamples = totalBytes / (bytesPerSample * channels)
  return (totalSamples / sampleRate) * 1000
}
