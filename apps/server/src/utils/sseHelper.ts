/**
 * SSE 工具函数
 */

/**
 * 格式化 SSE 消息
 * @param data 要发送的数据
 * @returns 格式化后的 SSE 消息字符串
 */
export function formatSSEMessage(data: any): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}
