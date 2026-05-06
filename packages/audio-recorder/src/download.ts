import type { RecorderResult } from './types'

export function downloadRecording(result: RecorderResult, filename = 'recording.wav'): void {
  const a = document.createElement('a')
  a.href = result.url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
