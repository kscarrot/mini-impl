import Koa from 'koa';
import type { Context, Next } from 'koa';
import http2 from 'http2';
import fs from 'fs';
import path from 'path';
import type { TLSSocket } from 'tls';

const app = new Koa();
const port = process.env.PORT || 3000;

// 中间件：记录请求时间和协议版本
app.use(async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const protocol = (ctx.req.socket as TLSSocket).alpnProtocol || 'http/1.1';
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms - Protocol: ${protocol}`);
});

// /api 路由处理
app.use(async (ctx: Context, next: Next) => {
  if (ctx.path === '/api') {
    ctx.body = {
      message: 'Hello from Koa with TypeScript and HTTP/2!',
      timestamp: new Date().toISOString(),
      protocol: (ctx.req.socket as TLSSocket).alpnProtocol || 'http/1.1',
    };
  } else {
    await next();
  }
});

// 静态文件服务，/ 或 /index.html 返回 index.html
app.use(async (ctx: Context, next: Next) => {
  if (ctx.path === '/' || ctx.path === '/index.html') {
    ctx.type = 'text/html';
    ctx.body = fs.createReadStream(path.join(__dirname, '../public/index.html'));
  } else {
    await next();
  }
});

// 创建 HTTP/2 服务器
const options = {
  key: fs.readFileSync(path.join(__dirname, '../certificates/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certificates/localhost.pem')),
  allowHTTP1: true, // 允许 HTTP/1.1 回退
};

const server = http2.createSecureServer(options, app.callback());

server.listen(port, () => {
  console.log(`HTTP/2 Server is running on https://localhost:${port}`);
});
