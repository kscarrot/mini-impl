import type { ChangeEvent, FC } from 'react'
import { RecorderState } from '@mini-impl/audio-recorder'
import {
  AlertCircle,
  CheckCircle2,
  FileAudio,
  Loader2,
  Mic,
  Square,
  Upload,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useAudioRecorder } from 'src/hooks/useAudioRecorder'

type InputMode = 'upload' | 'record'

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const AudioASR: FC = () => {
  const [mode, setMode] = useState<InputMode>('upload')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [duration, setDuration] = useState(0)

  const [file, setFile] = useState<File | null>(null)

  const recorder = useAudioRecorder({ targetSampleRate: 16000 })

  const switchMode = useCallback(
    (newMode: InputMode) => {
      if (loading)
        return
      setMode(newMode)
      setResult('')
      setError('')
      setFile(null)
      recorder.reset()
    },
    [loading, recorder],
  )

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setResult('')
      setError('')
    }
  }

  const submitToASR = async (audio: Blob | File, filename: string) => {
    setLoading(true)
    setError('')
    setResult('')

    const formData = new FormData()
    formData.append('file', audio, filename)
    formData.append('prompt', '如果识别到gongdan输出工单')

    const startTime = Date.now()
    try {
      const res = await fetch('/api/asr', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json() as { text?: string }
      setResult(data.text ?? '')
      setDuration(Date.now() - startTime)
    }
    catch (err) {
      console.error(err)
      setError('识别失败，请稍后重试')
    }
    finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file)
      return
    await submitToASR(file, file.name)
  }

  const handleToggleRecording = async () => {
    if (recorder.state === RecorderState.Recording) {
      const res = await recorder.stop()
      if (res) {
        await submitToASR(res.blob, 'recording.wav')
      }
    }
    else {
      setResult('')
      setError('')
      recorder.reset()
      await recorder.start()
    }
  }

  const isRecording = recorder.state === RecorderState.Recording

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl mb-5 shadow-lg">
            <FileAudio className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            语音识别系统
          </h1>
          <p className="text-gray-600 text-lg">
            上传音频文件或使用麦克风实时录音
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            type="button"
            onClick={() => switchMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              mode === 'upload'
                ? 'bg-white text-purple-700 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            上传文件
          </button>
          <button
            type="button"
            onClick={() => switchMode('record')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              mode === 'record'
                ? 'bg-white text-purple-700 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mic className="w-4 h-4" />
            麦克风录音
          </button>
        </div>

        <div className="space-y-6">
          {mode === 'upload' && (
            <>
              <div className="relative border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group">
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/flac,audio/ogg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="w-14 h-14 mx-auto mb-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                  <p className="text-gray-700 text-lg mb-2 font-medium">
                    点击选择音频文件
                  </p>
                  {file
                    ? (
                        <div className="mt-4 inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg">
                          <FileAudio className="w-4 h-4" />
                          <span className="font-medium">{file.name}</span>
                          <span className="text-sm text-purple-600">
                            (
                            {(file.size / 1024).toFixed(1)}
                            {' '}
                            KB)
                          </span>
                        </div>
                      )
                    : (
                        <p className="text-gray-500 text-sm mt-2">
                          支持 MP3 / WAV / FLAC / OGG 格式
                        </p>
                      )}
                </label>
              </div>

              <button
                type="button"
                onClick={() => void handleUpload()}
                disabled={!file || loading}
                className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {loading
                  ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        识别中，请稍候...
                      </>
                    )
                  : (
                      '开始识别'
                    )}
              </button>
            </>
          )}

          {mode === 'record' && (
            <>
              <div className="flex flex-col items-center py-8">
                <button
                  type="button"
                  onClick={() => void handleToggleRecording()}
                  disabled={loading}
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-300 scale-110'
                      : 'bg-linear-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}`}
                >
                  {isRecording && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                      <span className="absolute inset-[-8px] rounded-full border-4 border-red-300 animate-pulse" />
                    </>
                  )}

                  {isRecording
                    ? <Square className="w-12 h-12 text-white relative z-10" />
                    : <Mic className="w-12 h-12 text-white relative z-10" />}
                </button>

                <p className="mt-6 text-lg font-medium text-gray-700">
                  {loading
                    ? '识别中...'
                    : isRecording
                      ? '录音中，点击停止'
                      : '点击开始录音'}
                </p>

                {isRecording && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-2xl font-mono text-red-600 font-semibold tabular-nums">
                      {formatDuration(recorder.elapsedMs)}
                    </span>
                  </div>
                )}

                {loading && (
                  <div className="mt-4 flex items-center gap-3 text-purple-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">
                      正在发送到服务器识别...
                    </span>
                  </div>
                )}
              </div>

              {recorder.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-red-800 font-semibold mb-1">
                      录音失败
                    </h3>
                    <p className="text-red-600">{recorder.error}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold mb-1">识别失败</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-800">识别成功</h3>
              </div>
              <div className="bg-white rounded-lg p-5 mb-4">
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                  {result}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <span className="font-medium">识别耗时：</span>
                <span className="bg-green-100 px-3 py-1 rounded-full font-semibold">
                  {duration}
                  {' '}
                  ms
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AudioASR
