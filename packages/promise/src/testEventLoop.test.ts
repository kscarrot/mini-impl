describe('测试事件循环执行顺序', () => {
  let consoleLog: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    consoleLog = jest.fn();
  });

  afterEach(() => {
    consoleLog.mockRestore();
    jest.useRealTimers();
  });

  it('setTimeout和Promise的顺序 微任务清空后才会调用宏任务队列', async () => {
    // ----- 执行测试代码 -----
    consoleLog('start');

    setTimeout(function () {
      consoleLog('setTimeout1');
    }, 0);

    new Promise(resolve => {
      consoleLog('Promise1_execute');
      for (var i = 0; i < 10000; i++) {
        if (i === 10) {
          consoleLog('Promise1_loop_10');
        }
        i == 9999 && resolve(1);
      }
      // 即使调用了 resolve，函数体内的代码会继续执行直到函数结束
      consoleLog('Promise1_end');
    }).then(function () {
      consoleLog('Promise1_then1');
    });

    consoleLog('end');

    await jest.advanceTimersByTimeAsync(1000);

    // 验证执行顺序
    expect(consoleLog.mock.calls).toStrictEqual([
      ['start'],
      ['Promise1_execute'],
      ['Promise1_loop_10'],
      ['Promise1_end'],
      ['end'],
      ['Promise1_then1'],
      ['setTimeout1'],
    ]);
  });

  it('setTimeout里嵌套Promise的情况', async () => {
    const aysncCallExec = async () => {
      consoleLog('start');

      setTimeout(() => {
        consoleLog('setTimeout1');
        Promise.resolve().then(() => {
          consoleLog('setTimeout1_Promise1_then1');
        });
      }, 0);

      new Promise(resolve => {
        consoleLog('Promise2_execute');
        setTimeout(() => {
          consoleLog('Promise2_setTimeout1');
          resolve('Promise2_resolve');
        }, 0);
      }).then(res => {
        consoleLog('Promise2_then1');
        setTimeout(() => {
          consoleLog('Promise2_then1_setTimeout1');
          consoleLog(res);
        }, 0);
      });

      consoleLog('end');
    };

    await aysncCallExec();

    /**
     * 参考stackoverflow问题:https://stackoverflow.com/questions/52177631
     * 可以避免手动模拟调用栈
     */
    await jest.advanceTimersByTimeAsync(1000);

    expect(consoleLog.mock.calls).toStrictEqual([
      ['start'],
      ['Promise2_execute'],
      ['end'],
      ['setTimeout1'],
      ['setTimeout1_Promise1_then1'],
      ['Promise2_setTimeout1'],
      ['Promise2_then1'],
      ['Promise2_then1_setTimeout1'],
      ['Promise2_resolve'],
    ]);
  });

  it('async/await 的执行顺序', async () => {
    const aysncCallExec = async () => {
      async function async1() {
        consoleLog('async1 start');
        await async2();
        consoleLog('async1 end');
      }
      async function async2() {
        consoleLog('async2');
      }
      consoleLog('script start');
      setTimeout(() => {
        consoleLog('settimeout');
      });
      async1();
      new Promise(resolve => {
        consoleLog('promise1');
        resolve(0);
      }).then(function () {
        consoleLog('promise2');
      });
      consoleLog('script end');
    };

    await aysncCallExec();

    await jest.advanceTimersByTimeAsync(1000);

    expect(consoleLog.mock.calls).toStrictEqual([
      ['script start'],
      ['async1 start'],
      ['async2'],
      ['promise1'],
      ['script end'],
      ['async1 end'],
      ['promise2'],
      ['settimeout'],
    ]);
  });
});
