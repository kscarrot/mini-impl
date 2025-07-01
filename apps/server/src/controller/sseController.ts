import type { Context, Next } from 'koa';

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
    ctx.res.write(`data: ${JSON.stringify(connectMessage)}\n\n`);

    // 苏轼《定风波》诗词内容
    const dingFengBo = [
      '莫听穿林打叶声，何妨吟啸且徐行。',
      '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。',
      '料峭春风吹酒醒，微冷，山头斜照却相迎。',
      '回首向来萧瑟处，归去，也无风雨也无晴。',
    ];

    let messageCount = 0;
    const timer = setInterval(() => {
      try {
        messageCount++;
        const data = {
          type: 'content',
          msg: dingFengBo[messageCount - 1] || '诗词已结束',
          time: new Date().toISOString(),
          messageCount,
          author: '苏轼',
          title: '定风波·莫听穿林打叶声',
        };
        ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);

        if (messageCount >= 4) {
          const endMessage = {
            type: 'end',
            message: '苏轼《定风波》推送完毕',
            timestamp: new Date().toISOString(),
            totalMessages: messageCount,
          };
          ctx.res.write(`data: ${JSON.stringify(endMessage)}\n\n`);
          clearInterval(timer);
          ctx.res.end();
        }
      } catch (error) {
        clearInterval(timer);
      }
    }, 1000); // 每1秒推送一句

    ctx.req.on('close', () => {
      clearInterval(timer);
    });
  }
}
