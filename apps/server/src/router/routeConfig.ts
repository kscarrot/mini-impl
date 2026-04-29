import type { RouterConfig } from './registry.ts'
import { DefaultController } from '../controller/defaultController.ts'
import { MessageController } from '../controller/messageController.ts'
import { SSEController } from '../controller/sseController.ts'
import { collectRoutesFromControllers } from './registry.ts'

export type { RouterConfig }

// 路由配置（由装饰器元数据收集生成）
export const routerConfigs: RouterConfig[] = collectRoutesFromControllers([
  DefaultController,
  MessageController,
  SSEController,
])
