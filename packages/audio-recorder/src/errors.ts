import { RecorderErrorCode } from './types'

/**
 * 录音器错误类
 *
 * 统一封装所有录音过程中可能出现的错误，
 * 通过 `code` 字段提供可编程的错误分类。
 */
export class RecorderError extends Error {
  public readonly code: RecorderErrorCode
  public readonly cause?: unknown

  constructor(code: RecorderErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'RecorderError'
    this.code = code
    this.cause = cause
  }

  /**
   * 将 getUserMedia 抛出的 DOMException 映射为类型化的 RecorderError
   */
  static fromDOMException(err: DOMException): RecorderError {
    switch (err.name) {
      case 'NotAllowedError':
        return new RecorderError(
          RecorderErrorCode.PermissionDenied,
          '麦克风权限被拒绝，请允许浏览器使用麦克风。',
          err,
        )
      case 'NotFoundError':
        return new RecorderError(
          RecorderErrorCode.DeviceNotFound,
          '未找到音频输入设备，请检查麦克风是否连接。',
          err,
        )
      default:
        return new RecorderError(RecorderErrorCode.Unknown, err.message, err)
    }
  }
}
