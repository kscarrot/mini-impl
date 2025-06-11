import type { Context, Next } from 'koa';
import type { TLSSocket } from 'tls';

export const hello = async (ctx: Context, next: Next) => {
  if (ctx.path === '/api') {
    ctx.body = {
      message: 'Hello from Koa with TypeScript and HTTP/2!',
      timestamp: new Date().toISOString(),
      protocol: (ctx.req.socket as TLSSocket).alpnProtocol || 'http/1.1',
    };
  } else {
    await next();
  }
};
