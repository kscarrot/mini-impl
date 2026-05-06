# @mini-impl/audio-recorder

浏览器端基于 **Web Audio API + AudioWorklet** 的录音 SDK（降采样、16-bit PCM、WAV 组装）。

## 使用

```ts
import { AudioRecorder, RecorderState } from '@mini-impl/audio-recorder'

const recorder = new AudioRecorder({ targetSampleRate: 16000 })
await recorder.start()
const result = await recorder.stop()
recorder.download(result, 'recording.wav')
```

详见源码注释与类型导出。
