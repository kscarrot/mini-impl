import type { Context, Next } from 'koa'
import { Controller, Get, Post } from '../router/decorators.ts'

// 全局变量，用于存储当前活跃的SSE连接
let currentSSEConnection: { res: any, req: any } | null = null

// 设置当前SSE连接
function setCurrentSSEConnection(res: any, req: any) {
  currentSSEConnection = { res, req }
  console.log('新的消息接收连接已建立')
}

// 清除当前SSE连接
function clearCurrentSSEConnection() {
  currentSSEConnection = null
  console.log('消息接收连接已清除')
}

@Controller('/api')
export class MessageController {
  // 发送消息到当前活跃的SSE连接
  @Post('/send-message')
  async sendMessage(ctx: Context, _: Next): Promise<void> {
    try {
      const { message } = ctx.request.body as { message?: string }

      if (!message || typeof message !== 'string') {
        ctx.status = 400
        ctx.body = {
          success: false,
          error: '消息内容不能为空且必须是字符串',
        }
        return
      }

      if (!currentSSEConnection) {
        ctx.status = 404
        ctx.body = {
          success: false,
          error: '没有活跃的消息接收连接',
        }
        return
      }

      // 构造消息对象
      const messageData = {
        type: 'message',
        content: message,
        timestamp: new Date().toISOString(),
        sender: 'message-editor',
      }

      // 发送SSE消息
      const sseMessage = `data: ${JSON.stringify(messageData)}\n\n`

      try {
        currentSSEConnection.res.write(sseMessage)
        console.log('消息已推送到SSE连接:', message)

        ctx.body = {
          success: true,
          message: '消息发送成功',
          data: messageData,
        }
      }
      catch (error) {
        console.error('推送消息到SSE连接失败:', error)
        ctx.status = 500
        ctx.body = {
          success: false,
          error: '推送消息失败',
        }
      }
    }
    catch (error) {
      console.error('发送消息处理失败:', error)
      ctx.status = 500
      ctx.body = {
        success: false,
        error: '服务器内部错误',
      }
    }
  }

  // 处理接收消息的SSE连接
  @Get('/receive-message')
  async receiveMessage(ctx: Context, _: Next): Promise<void> {
    console.log('消息接收连接已建立')

    // 设置SSE响应头
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    ctx.status = 200
    ctx.respond = false // 防止Koa自动结束响应

    const res = ctx.res
    const req = ctx.req

    // 发送连接成功消息
    const connectMessage = {
      type: 'connected',
      message: `消息接收连接已建立,协议: ${ctx.req.httpVersion}`,
      timestamp: new Date().toISOString(),
    }

    const connectSSE = `data: ${JSON.stringify(connectMessage)}\n\n`
    res.write(connectSSE)

    // 注册为当前活跃的SSE连接
    setCurrentSSEConnection(res, req)

    // 处理连接关闭
    req.on('close', () => {
      console.log('消息接收连接已关闭')
      clearCurrentSSEConnection()
    })

    // 处理连接错误
    req.on('error', (error) => {
      console.error('消息接收连接错误:', error)
      clearCurrentSSEConnection()
    })
  }
}
