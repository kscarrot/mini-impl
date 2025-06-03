export function catch_<T>(promise: Promise<T>, onRejected: (reason: any) => any): Promise<T> {
  return promise.then(undefined, onRejected);
}

export function _finally<T>(promise: Promise<T>, onFinally: () => void): Promise<T> {
  return promise.then(
    value => {
      onFinally();
      return value;
    },
    reason => {
      onFinally();
      throw reason;
    },
  );
}

export function all<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    let completedCount = 0;

    // 如果传入空数组，直接返回空数组
    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          results[index] = value;
          completedCount++;

          // 当所有promise都完成时，返回结果数组
          if (completedCount === promises.length) {
            resolve(results);
          }
        },
        reason => {
          // 任何一个promise失败，立即reject
          reject(reason);
        },
      );
    });
  });
}

export function allSettled<T>(promises: Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
  return new Promise(resolve => {
    const results: PromiseSettledResult<T>[] = [];
    let completedCount = 0;

    // 如果传入空数组，直接返回空数组
    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          results[index] = { status: 'fulfilled', value };
          completedCount++;

          // 当所有promise都完成时，返回结果数组
          if (completedCount === promises.length) {
            resolve(results);
          }
        },
        reason => {
          results[index] = { status: 'rejected', reason };
          completedCount++;

          // 当所有promise都完成时，返回结果数组
          if (completedCount === promises.length) {
            resolve(results);
          }
        },
      );
    });
  });
}

export function race<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    // 如果传入空数组，返回一个永远pending的promise
    if (promises.length === 0) {
      return;
    }

    // 外层的状态只能变更一次,所有promise执行resolve或reject,速度快的执行
    promises.forEach(promise => {
      Promise.resolve(promise).then(resolve, reject);
    });
  });
}
export function any<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    // 如果传入空数组，返回一个永远pending的promise
    if (promises.length === 0) {
      return;
    }

    const errors: any[] = [];
    let completedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          // 任何一个promise成功就立即resolve
          resolve(value);
        },
        reason => {
          errors[index] = reason;
          completedCount++;

          // 当所有promise都失败时，才reject
          if (completedCount === promises.length) {
            reject(new Error('All promises were rejected'));
          }
        },
      );
    });
  });
}

export function concurrent<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) {
      resolve([]);
      return;
    }

    const results: T[] = [];
    let running = 0;
    let completed = 0;
    let index = 0;

    function runTask() {
      if (index >= tasks.length) {
        return;
      }

      const currentIndex = index++;
      running++;

      tasks[currentIndex]()
        .then(result => {
          results[currentIndex] = result;
        })
        .catch(reject)
        .finally(() => {
          running--;
          completed++;

          if (completed === tasks.length) {
            resolve(results);
          } else {
            runTask();
          }
        });
    }

    // 启动初始的并发任务
    for (let i = 0; i < Math.min(limit, tasks.length); i++) {
      runTask();
    }
  });
}
