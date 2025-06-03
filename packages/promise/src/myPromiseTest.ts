import { createRequire } from 'module';
import MyPromise from './myPromise.ts';

const require = createRequire(import.meta.url);
const promisesAplusTests = require('promises-aplus-tests');

const adapter = {
  resolved: (value: any) => MyPromise.resolve(value),
  rejected: (reason: any) => MyPromise.reject(reason),
  deferred: () => {
    let resolve: (value: any) => void;
    let reject: (reason: any) => void;
    const promise = new MyPromise((res: (value: any) => void, rej: (reason: any) => void) => {
      resolve = res;
      reject = rej;
    });
    return {
      promise,
      resolve: resolve!,
      reject: reject!,
    };
  },
};

promisesAplusTests(adapter, function (err: any) {
  if (err) {
    console.error('测试失败:', err);
    process.exit(1);
  }
  console.log('所有测试通过！');
});
