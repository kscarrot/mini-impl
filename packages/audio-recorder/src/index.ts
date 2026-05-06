/**
 * 音频录制工具库 — 基于 WebAudio API + AudioWorklet
 */

export { to16BitPCM, to16kHz } from './audio-processing'
export { AudioRecorder } from './AudioRecorder'
export { downloadRecording } from './download'
export { RecorderError } from './errors'
export {
  RecorderErrorCode,
  RecorderEvent,
  type RecorderEventHandler,
  type RecorderEventMap,
  type RecorderOptions,
  type RecorderResult,
  RecorderState,
  type ResolvedRecorderOptions,
} from './types'
export { computeDurationMs, encodeWAV } from './wav'
