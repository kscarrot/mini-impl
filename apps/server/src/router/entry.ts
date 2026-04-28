import type { HTTPMethod } from 'find-my-way'
import type { Context, Next } from 'koa'
import findMyWay from 'find-my-way'
import { routerConfigs } from './routeConfig.ts'

function router() {
  const r = findMyWay()

  for (const config of routerConfigs) {
    r.on(config.method, config.path, config.handler as any)
  }

  console.log(r.prettyPrint())

  return (ctx: Context, next: Next) => {
    const handler = r.find(ctx.req.method as HTTPMethod, ctx.path) as unknown as {
      handler: (ctx: Context, next: Next) => Promise<void>
      params: { [k: string]: string | undefined }
    }
    if (!handler) {
      return next()
    }
    else {
      ctx.params = handler.params
      return handler.handler(ctx, next)
    }
  }
}

export { router }
