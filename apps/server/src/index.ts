import fs from 'node:fs'
import http2 from 'node:http2'
import path from 'node:path'
import process from 'node:process'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import { logger } from './middleware/logger.ts'
import { router } from './router/entry.ts'
import { setupWebSocket } from './websocket.ts'

const certificatesDir = path.resolve(process.cwd(), 'certificates')
const app = new Koa()
const port = process.env.PORT || 3000

app.use(logger) // 日志中间件
app.use(bodyParser()) // 解析请求体中间件
app.use(router())
app.use(serve('public')) // 静态文件服务

const server = http2.createSecureServer(
  {
    key: fs.readFileSync(path.join(

      certificatesDir,
      'localhost-key.pem',
    )),
    cert: fs.readFileSync(path.join(certificatesDir, 'localhost.pem')),
    allowHTTP1: true, // 允许 HTTP/1.1 回退
  },
  app.callback(),
)

// 设置 WebSocket 服务器
setupWebSocket(server)

server.listen(port, () => {
  console.log(`HTTP/2 Server is running on https://localhost:${port}`)
  console.log(`Navigation page: https://localhost:${port}/`)
  console.log(`Protocol Test page: https://localhost:${port}/protocol-test.html`)
  console.log(`WebSocket Server page: https://localhost:${port}/websocket.html`)
  console.log(`SSE Server page: https://localhost:${port}/sse.html`)
  console.log(`Message Sender page: https://localhost:${port}/send-message.html`)
  console.log(`Message Receiver page: https://localhost:${port}/receive-message.html`)
})
