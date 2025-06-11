import findMyWay from 'find-my-way';
import type { HTTPMethod } from 'find-my-way';
import type { Context, Next } from 'koa';

type RouterConfig = {
  method: HTTPMethod;
  path: string;
  handler: (ctx: Context, next: Next) => Promise<void>;
};

const defaultHandler = async (ctx: Context, next: Next) => {
  ctx.body = {
    message: `RouterHander Path:${ctx.path}`,
    timestamp: new Date().toISOString(),
  };
  await next();
};
const router = () => {
  const r = findMyWay();

  const routerConfigs: RouterConfig[] = [
    { method: 'GET', path: '/test', handler: defaultHandler },
    { method: 'GET', path: '/test/hello', handler: defaultHandler },
    { method: 'GET', path: '/testing', handler: defaultHandler },
    {
      method: 'GET',
      path: '/testing/:param',
      handler: (ctx, next) => {
        console.log('testing/:param', ctx.params);
        ctx.body = {
          message: `RouterHander Path:${ctx.path}`,
          timestamp: new Date().toISOString(),
          params: ctx.params.param,
        };
        return next();
      },
    },
    { method: 'POST', path: '/update', handler: defaultHandler },
  ];

  for (const config of routerConfigs) {
    r.on(config.method, config.path, config.handler as any);
  }

  console.log(r.prettyPrint());

  return (ctx: Context, next: Next) => {
    console.log('router-call:', ctx.req.method, ctx.path);
    const handler = r.find(ctx.req.method as HTTPMethod, ctx.path) as unknown as {
      handler: (ctx: Context, next: Next) => Promise<void>;
      params: { [k: string]: string | undefined };
    };
    console.log('handler:', handler);
    if (!handler) {
      return next();
    } else {
      ctx.params = handler.params;
      return handler.handler(ctx, next);
    }
  };
};

export { router };
