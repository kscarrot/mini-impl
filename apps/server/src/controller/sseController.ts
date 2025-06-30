import type { Context, Next } from 'koa';
import { formatSSEMessage } from '../utils/sseHelper';

/**
 * SSE Controller
 */
export class SSEController {
  /**
   * 处理 SSE 连接
   */
  static async handleSSE(ctx: Context, next: Next): Promise<void> {
    console.log('SSE connection established');

    ctx.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    /**
     * 首次连接时，设置状态码为200，并设置respond 避免koa自动结束响应
     */
    ctx.status = 200;
    ctx.respond = false;

    const connectMessage = {
      type: 'connected',
      message: `SSE连接已建立,协议: ${ctx.req.httpVersion}`,
      timestamp: new Date().toISOString(),
    };
    ctx.res.write(formatSSEMessage(connectMessage));

    let messageCount = 0;
    const timer = setInterval(() => {
      try {
        messageCount++;
        const data = {
          msg: '服务器推送消息',
          time: new Date().toISOString(),
          count: Math.floor(Math.random() * 1000),
          messageCount,
        };
        ctx.res.write(formatSSEMessage(data));

        if (messageCount >= 10) {
          const endMessage = {
            type: 'end',
            message: 'SSE连接结束，已发送10条消息',
            timestamp: new Date().toISOString(),
            totalMessages: messageCount,
          };
          ctx.res.write(formatSSEMessage(endMessage));
          clearInterval(timer);
          ctx.res.end();
        }
      } catch (error) {
        clearInterval(timer);
      }
    }, 1000);

    ctx.req.on('close', () => {
      clearInterval(timer);
    });
  }
}
