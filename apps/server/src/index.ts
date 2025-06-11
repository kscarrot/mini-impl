import Koa from 'koa';
import http2 from 'http2';
import fs from 'fs';
import path from 'path';
import serve from 'koa-static';
import { setupWebSocket } from './websocket';
import { logger } from './middleware/logger';
import { hello } from './router/hello';
import { router } from './router/entry';

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(logger); // 日志中间件
app.use(hello); // 路由中间件
app.use(router());
app.use(serve('public')); // 静态文件服务

const server = http2.createSecureServer(
  {
    key: fs.readFileSync(path.join(__dirname, '../certificates/localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certificates/localhost.pem')),
    allowHTTP1: true, // 允许 HTTP/1.1 回退
  },
  app.callback(),
);

// 设置 WebSocket 服务器
setupWebSocket(server);

server.listen(port, () => {
  console.log(`HTTP/2 Server is running on https://localhost:${port}`);
});
