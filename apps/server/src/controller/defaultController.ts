import type { Context, Next } from 'koa'
import type { TLSSocket } from 'node:tls'
import { Controller, Get } from '../router/decorators.ts'

@Controller('/api')
export class DefaultController {
  // 默认处理器
  @Get('/hello')
  async hello(ctx: Context, next: Next): Promise<void> {
    ctx.body = {
      message: `RouterHander Path:${ctx.path}`,
      timestamp: new Date().toISOString(),
      protocol: (ctx.req.socket as TLSSocket).alpnProtocol || 'http/1.1',
    }
    await next()
  }

  // 参数处理器
  @Get('/:param')
  async param(ctx: Context, next: Next): Promise<void> {
    console.log('路径:', ctx.path, '参数:', ctx.params)
    ctx.body = {
      message: `RouterHander Path:${ctx.path}`,
      timestamp: new Date().toISOString(),
      params: ctx.params.param,
    }
    return next()
  }
}
