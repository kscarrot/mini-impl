import Koa, { Context, Next } from 'koa';

const app = new Koa();
const port = process.env.PORT || 3000;

// 中间件：记录请求时间
app.use(async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 路由处理
app.use(async (ctx: Context) => {
  ctx.body = {
    message: 'Hello from Koa with TypeScript!',
    timestamp: new Date().toISOString(),
  };
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
