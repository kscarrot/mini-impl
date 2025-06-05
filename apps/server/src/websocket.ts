import { WebSocketServer, WebSocket } from 'ws';
import { Http2SecureServer } from 'http2';

const HEARTBEAT_INTERVAL = 30000; // 30秒

export function setupWebSocket(server: Http2SecureServer) {
  const wss = new WebSocketServer({
    server: server as any,
    path: '/ws',
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    // 设置心跳检测
    let isAlive = true;
    const heartbeat = () => {
      isAlive = true;
    };

    // 设置定时器，定期检查客户端是否存活
    const interval = setInterval(() => {
      if (!isAlive) {
        console.log('Client timeout, terminating connection');
        return ws.terminate();
      }

      isAlive = false;
      ws.ping();
    }, HEARTBEAT_INTERVAL);

    // 监听 pong 消息
    ws.on('pong', heartbeat);

    ws.on('message', (message: Buffer) => {
      // 将消息转换为字符串
      const text = message.toString();
      console.log('Received:', text);

      // 发送回显消息
      ws.send(`服务器收到: ${text}`);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });

    // 发送欢迎消息
    ws.send('欢迎连接到WebSocket服务器！');
  });

  return wss;
}
