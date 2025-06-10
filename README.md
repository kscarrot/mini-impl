# mini-impl

## 工程化

- 一键启动项配置[launch](https://github.com/kscarrot/mini-impl/blob/main/.vscode/launch.json),[task](https://github.com/kscarrot/mini-impl/blob/main/.vscode/tasks.json)
- 基于pnpm实现的`monorepo`,以及配置同步
- 单元测试配置

## 子包

- [@ks/promise](https://github.com/kscarrot/mini-impl/tree/main/packages/promise)Promise和事件循环的实现和测试

- [@ks/reactive](https://github.com/kscarrot/mini-impl/tree/main/packages/reactive)vue2响应式原理

- [@ks/vue2wrapper](https://github.com/kscarrot/mini-impl/tree/main/packages/vue2wrapper)基于WebComponent的跨框架组件封装最小实现

## 最小实现

- [http2](https://github.com/kscarrot/mini-impl/blob/main/apps/server/src/index.ts)和[websocket](https://github.com/kscarrot/mini-impl/blob/main/apps/server/src/websocket.ts)

## WIP

- koa midware traceId 追踪
- react formliy
- storybook 组件化
- protobuf 自动生成服务
- DDD 实践
