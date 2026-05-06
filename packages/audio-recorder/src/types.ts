/**
 * 录音器生命周期状态
 *
 */
export const RecorderState = {
  /** 已构造，尚未开始 */
  Idle: 'idle',
  /** 正在请求麦克风权限 */
  Requesting: 'requesting',
  /** 正在录音 */
  Recording: 'recording',
  /** 正在停止（flush 最后的数据） */
  Stopping: 'stopping',
  /** 已停止，WAV 文件可用 */
  Stopped: 'stopped',
  /** 不可恢复的错误 */
  Error: 'error',
} as const

export type RecorderState = ValuesOf<typeof RecorderState>

/**
 * 录音器错误码
 */
export const RecorderErrorCode = {
  PermissionDenied: 'PERMISSION_DENIED',
  DeviceNotFound: 'DEVICE_NOT_FOUND',
  WorkletLoadFailed: 'WORKLET_LOAD_FAILED',
  InvalidState: 'INVALID_STATE',
  Unknown: 'UNKNOWN',
} as const

export type RecorderErrorCode = ValuesOf<typeof RecorderErrorCode>

/**
 * 录音器配置项
 */
export interface RecorderOptions {
  /** 降采样目标采样率，默认 16000 */
  targetSampleRate?: number

  /** AudioWorklet 批量发送间隔（毫秒），默认 200 */
  batchDurationMs?: number

  /** getUserMedia 的 audio 约束，会与 { audio: true } 合并 */
  audioConstraints?: MediaTrackConstraints
}

/**
 * 内部使用的已解析配置（所有字段必填）
 */
export interface ResolvedRecorderOptions {
  targetSampleRate: number
  batchDurationMs: number
  audioConstraints: MediaTrackConstraints
}

/**
 * 录音结果
 */
export interface RecorderResult {
  /** 最终 WAV 文件的 Blob（type: audio/wav） */
  blob: Blob

  /** 可直接使用的 Object URL，调用者用完后需 revokeObjectURL */
  url: string

  /** 录音时长（毫秒） */
  durationMs: number
}

/**
 * 录音器事件名
 */
export const RecorderEvent = {
  /** 每次状态变化时触发 */
  StateChange: 'state_change',
  /** 每次从 AudioWorklet 收到一批 PCM 数据时触发 */
  DataAvailable: 'data_available',
  /** stop() 完成后、WAV Blob 就绪时触发 */
  Result: 'result',
  /** 任何错误（权限拒绝、Worklet 加载失败等）时触发 */
  Error: 'error',
} as const

export type RecorderEvent = ValuesOf<typeof RecorderEvent>

/**
 * 事件名 → 回调参数的类型映射
 */
export interface RecorderEventMap {
  [RecorderEvent.StateChange]: RecorderState
  [RecorderEvent.DataAvailable]: ArrayBuffer
  [RecorderEvent.Result]: RecorderResult
  [RecorderEvent.Error]: import('./errors').RecorderError
}

export type RecorderEventHandler<K extends RecorderEvent> = (
  payload: RecorderEventMap[K],
) => void
