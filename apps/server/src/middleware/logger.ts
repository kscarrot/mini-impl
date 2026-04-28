import type { Context, Next } from 'koa'
import type { TLSSocket } from 'node:tls'

export async function logger(ctx: Context, next: Next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  const protocol = (ctx.req.socket as TLSSocket).alpnProtocol || 'http/1.1'
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms - Protocol: ${protocol}`)
}
