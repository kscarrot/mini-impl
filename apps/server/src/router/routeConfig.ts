import type { HTTPMethod } from 'find-my-way';
import type { Context, Next } from 'koa';
import { TLSSocket } from 'tls';
import { SSEController } from '../controller/sseController';

export type RouterConfig = {
  method: HTTPMethod;
  path: string;
  handler: (ctx: Context, next: Next) => Promise<void>;
};

// 默认处理器
export const defaultHandler = async (ctx: Context, next: Next) => {
  ctx.body = {
    message: `RouterHander Path:${ctx.path}`,
    timestamp: new Date().toISOString(),
    protocol: (ctx.req.socket as TLSSocket).alpnProtocol || 'http/1.1',
  };
  await next();
};

// 参数处理器
export const paramHandler = async (ctx: Context, next: Next) => {
  console.log('路径:', ctx.path, '参数:', ctx.params);
  ctx.body = {
    message: `RouterHander Path:${ctx.path}`,
    timestamp: new Date().toISOString(),
    params: ctx.params.param,
  };
  return next();
};

// 路由配置
export const routerConfigs: RouterConfig[] = [
  { method: 'GET', path: '/api/hello', handler: defaultHandler },
  { method: 'GET', path: '/api/:param', handler: paramHandler },
  { method: 'GET', path: '/api/sse', handler: SSEController.handleSSE },
];
