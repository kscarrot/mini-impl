import type { HTTPMethod } from 'find-my-way'
import type { Context, Next } from 'koa'
import type { RouteMeta } from './decorators.ts'
import { joinPath, PREFIX_SYM, ROUTE_META_SYM } from './decorators.ts'

export interface RouterConfig {
  method: HTTPMethod
  path: string
  handler: (ctx: Context, next: Next) => Promise<void>
}

const singletons = new WeakMap<new (...args: any[]) => any, any>()

/**
 * 控制器单例缓存：
 * - 每个 Controller 类只实例化一次；
 * - 避免在每次请求时重复 new，保持与传统「类单例控制器」一致的语义。
 */
function getSingleton<C extends new (...args: any[]) => any>(Ctor: C): InstanceType<C> {
  let inst = singletons.get(Ctor)
  if (!inst) {
    inst = new Ctor()
    singletons.set(Ctor, inst)
  }
  return inst as InstanceType<C>
}

function hasPathParam(path: string): boolean {
  return /\/:[^/]+/.test(path)
}

/**
 * 注册顺序策略（非常关键）：
 * - 先注册静态路由，如 `/api/hello`、`/api/sse`；
 * - 后注册参数路由，如 `/api/:param`；
 * - 同类型内部按路径长度倒序，尽量让更具体的路由优先。
 *
 * 这样可避免 `/:param` 过早吞掉本应命中的静态路由。
 */
function sortRoutesForRegistration(routes: RouterConfig[]): RouterConfig[] {
  return [...routes].sort((a, b) => {
    const ap = hasPathParam(a.path) ? 1 : 0
    const bp = hasPathParam(b.path) ? 1 : 0
    if (ap !== bp)
      return ap - bp
    return b.path.length - a.path.length
  })
}

export function collectRoutesFromControllers(
  ctors: Array<new (...args: any[]) => any>,
): RouterConfig[] {
  /**
   * 该函数职责：
   * 1) 扫描传入的 Controller 类；
   * 2) 读取类装饰器和方法装饰器写入的元数据；
   * 3) 组装成 find-my-way 可直接注册的 RouterConfig[]；
   * 4) 对路由做稳定排序，确保动态参数路由最后注册。
   */
  const raw: RouterConfig[] = []

  for (const Ctor of ctors) {
    // 读取 `@Controller('/prefix')` 写在构造函数上的前缀元数据
    const prefix = (Ctor as any)[PREFIX_SYM] as string | undefined
    if (prefix == null)
      throw new Error(`Missing @Controller on ${Ctor.name}`)

    // 每个 Controller 使用单例实例，供所有 handler 复用
    const inst = getSingleton(Ctor)
    const proto = Ctor.prototype as object

    // 遍历原型方法，寻找被 `Route/Get/Post` 标记过的处理函数
    for (const key of Reflect.ownKeys(proto)) {
      if (key === 'constructor')
        continue
      const fn = Object.getOwnPropertyDescriptor(proto, key)?.value
      if (typeof fn !== 'function')
        continue

      const meta = (fn as any)[ROUTE_META_SYM] as RouteMeta | undefined
      if (!meta)
        continue

      // 将类前缀与方法子路径拼接成最终路由
      const path = joinPath(prefix, meta.subPath)
      raw.push({
        method: meta.method,
        path,
        handler: async (ctx: Context, next: Next) => {
          // 通过元数据保存的方法名，从实例上拿到真实 handler
          const handler = (inst as any)[meta.propertyKey] as
            | ((c: Context, n: Next) => Promise<void>)
            | undefined
          if (!handler)
            return next()
          // 强制绑定到 controller 实例，确保 this 指向正确
          return handler.call(inst, ctx, next)
        },
      })
    }
  }

  // 返回按优先级排好序的路由列表，供 router/entry.ts 逐个注册
  return sortRoutesForRegistration(raw)
}
