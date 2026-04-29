import type { Context, Next } from 'koa'
import type { TLSSocket } from 'node:tls'

const RESET = '\x1B[0m'
const GREEN = '\x1B[32m'
const YELLOW = '\x1B[33m'
const BLUE = '\x1B[34m'
const RED = '\x1B[31m'
const CYAN = '\x1B[36m'

function colorize(text: string, color: string): string {
  return `${color}${text}${RESET}`
}

function colorMethod(method: string): string {
  if (method === 'GET')
    return colorize(method, GREEN)
  if (method === 'POST')
    return colorize(method, BLUE)
  return colorize(method, CYAN)
}

function colorLatency(ms: number): string {
  if (ms < 50)
    return colorize(`${ms}ms`, GREEN)
  if (ms > 100)
    return colorize(`${ms}ms`, RED)
  return colorize(`${ms}ms`, YELLOW)
}

export async function logger(ctx: Context, next: Next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  const protocol = (ctx.req.socket as TLSSocket).alpnProtocol || 'http/1.1'
  const method = colorMethod(ctx.method)
  const latency = colorLatency(ms)
  console.log(`${method} ${ctx.url} - ${latency} - Protocol: ${protocol}`)
}
