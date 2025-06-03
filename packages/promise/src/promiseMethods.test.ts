import { all, allSettled, _finally, race, any, concurrent } from './promiseMethods.ts';

describe('测试 Promise all allSettled', () => {
  test('空值情况', () => {
    const promises: Promise<any>[] = [];
    expect(all(promises)).resolves.toEqual([]);
    expect(allSettled(promises)).resolves.toEqual([]);
  });

  it('全部成功的情况', async () => {
    const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const mockFullfilled = jest.fn();
    await all(promises).then(mockFullfilled);
    expect(mockFullfilled).toHaveBeenCalledTimes(1);
    const result = await all(promises);
    expect(result).toEqual([1, 2, 3]);

    const mockFullfilledSettled = jest.fn();
    await allSettled(promises).then(mockFullfilledSettled);
    expect(mockFullfilledSettled).toHaveBeenCalledTimes(1);
    const resultSettled = await allSettled(promises);
    expect(resultSettled).toStrictEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'fulfilled', value: 2 },
      { status: 'fulfilled', value: 3 },
    ]);
  });

  it('单个异常', async () => {
    const promises = [Promise.resolve(1), Promise.reject(new Error('error')), Promise.resolve(3)];
    const mockFullfilled = jest.fn();
    const mockRejected = jest.fn();

    expect(all(promises).then(mockFullfilled)).rejects.toThrow('error');
    expect(mockFullfilled).toHaveBeenCalledTimes(0);
    expect(mockRejected).toHaveBeenCalledTimes(0);

    const result = await all(promises).catch(mockRejected);
    expect(mockRejected).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();

    const mockFullfilledSettled = jest.fn();
    await allSettled(promises).then(mockFullfilledSettled);
    expect(mockFullfilledSettled).toHaveBeenCalledTimes(1);
    const resultSettled = await allSettled(promises);
    expect(resultSettled).toStrictEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'rejected', reason: new Error('error') },
      { status: 'fulfilled', value: 3 },
    ]);
  });

  it('多个异常', async () => {
    const promises = [Promise.reject(new Error('error1')), Promise.reject(new Error('error2'))];
    expect(all(promises)).rejects.toThrow('error1');

    const mockFullfilledSettled = jest.fn();
    await allSettled(promises).then(mockFullfilledSettled);
    expect(mockFullfilledSettled).toHaveBeenCalledTimes(1);
    const resultSettled = await allSettled(promises);
    expect(resultSettled).toStrictEqual([
      { status: 'rejected', reason: new Error('error1') },
      { status: 'rejected', reason: new Error('error2') },
    ]);
  });
});

describe('测试 Promise _finally', () => {
  it('正常情况', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve('success');
      }, 0);
    });
    const mockFinally = jest.fn();
    const result = await _finally(promise, mockFinally);
    expect(mockFinally).toHaveBeenCalledTimes(1);
    expect(result).toBe('success');
  });

  it('异常情况', async () => {
    const promise = new Promise((_, reject) => {
      reject(new Error('error'));
    });
    const mockFinally = jest.fn();
    const mockRejected = jest.fn();
    const result = await _finally(promise, mockFinally).catch(mockRejected);

    expect(mockFinally).toHaveBeenCalledTimes(1);
    expect(mockRejected).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });
});

describe('测试 Promise race', () => {
  it('正常情况', async () => {
    const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const result = await race(promises);
    expect(result).toBe(1);
  });

  it('异常情况', async () => {
    const promises = [Promise.reject(new Error('error1')), Promise.reject(new Error('error2'))];
    const mockRejected = jest.fn();
    const result = await race(promises).catch(mockRejected);
    expect(mockRejected).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });
});

describe('测试 Promise any', () => {
  it('正常情况', async () => {
    const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const result = await any(promises);
    expect(result).toBe(1);
  });

  it('异常情况', async () => {
    const promises = [Promise.reject(new Error('error1')), Promise.reject(new Error('error2'))];
    const mockRejected = jest.fn();
    const result = await any(promises).catch(mockRejected);
    expect(mockRejected).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });
});

describe('测试并发控制 concurrent', () => {
  it('并发控制结果正确', async () => {
    const tasks = [() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)];
    const result = await concurrent(tasks, 2);
    expect(result).toEqual([1, 2, 3]);
  });
});
