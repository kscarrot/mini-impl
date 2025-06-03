const PROMISE_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
} as const;

type PromiseStatus = (typeof PROMISE_STATUS)[keyof typeof PROMISE_STATUS];

class MyPromise<T> {
  status: PromiseStatus = PROMISE_STATUS.PENDING;
  value: T | undefined;
  reason?: any;
  onFulfilledCallbacks: (() => void)[] = [];
  onRejectedCallbacks: (() => void)[] = [];

  constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
    const resolve = (value: T) => {
      if (this.status === PROMISE_STATUS.PENDING) {
        this.status = PROMISE_STATUS.FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(callback => callback());
      }
    };

    const reject = (reason: any) => {
      if (this.status === PROMISE_STATUS.PENDING) {
        this.status = PROMISE_STATUS.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(callback => callback());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled: (value?: T) => void, onRejected: (reason: any) => void) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    // prettier-ignore
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };

    const promise2 = new MyPromise((resolve, reject) => {
      switch (this.status) {
        case PROMISE_STATUS.FULFILLED: {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
          break;
        }
        case PROMISE_STATUS.REJECTED:
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
          break;
        case PROMISE_STATUS.PENDING: {
          this.onFulfilledCallbacks.push(() => {
            setTimeout(() => {
              try {
                const x = onFulfilled(this.value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (error) {
                reject(error);
              }
            });
          });
          this.onRejectedCallbacks.push(() => {
            setTimeout(() => {
              try {
                const x = onRejected(this.reason);
                resolvePromise(promise2, x, resolve, reject);
              } catch (error) {
                reject(error);
              }
            });
          });
          break;
        }
      }
    });

    return promise2;
  }

  static resolve(value: any) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason: any) {
    return new MyPromise((_, reject) => {
      reject(reason);
    });
  }
}

function resolvePromise<T>(
  promise2: MyPromise<T>,
  x: any,
  resolve: (value: T) => void,
  reject: (reason: any) => void,
): void;

function resolvePromise<T>(promise2: MyPromise<T>, x: any, resolve: (value: T) => void, reject: (reason: any) => void) {
  // 1. 如果 promise2 和 x 相同，抛出 TypeError
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  // 标记是否已调用，防止多次调用
  let called = false;

  // 2. 如果 x 是 HYPromise 实例
  if (x instanceof MyPromise) {
    // 根据 x 的状态调用 resolve 或 reject
    x.then(
      y => {
        resolvePromise(promise2, y, resolve, reject);
      },
      reason => {
        reject(reason);
      },
    );
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 3. 如果 x 是对象或函数
    try {
      // 获取 x 的 then 方法
      const then = x.then as MyPromise<T>['then'];
      if (typeof then === 'function') {
        // 如果 then 是函数
        // 使用 x 作为上下文调用 then 方法
        then.call(
          x,
          y => {
            // 成功回调
            if (called) return; // 如果已经调用过，直接返回
            called = true;
            // 递归处理 y
            resolvePromise(promise2, y, resolve, reject);
          },
          reason => {
            // 失败回调
            if (called) return; // 如果已经调用过，直接返回
            called = true;
            reject(reason);
          },
        );
      } else {
        // 如果 then 不是函数
        // 直接调用 resolve
        resolve(x);
      }
    } catch (error) {
      // 如果获取或调用 then 方法抛出异常
      if (called) return; // 如果已经调用过，直接返回
      called = true;
      reject(error);
    }
  } else {
    // 4. 如果 x 不是对象或函数
    // 直接调用 resolve
    resolve(x);
  }
}

export default MyPromise;
