import { observe, createCollector } from './defineProperty.ts';

describe('测试Object.defineProperty响应性', () => {
  test('test', () => {
    let data = {
      objKey: {
        subObjKey: 1,
      },
      primitiveKey: 2,
      arrayKey: [{ arraItemKey: 9 }, 2, 3],
    };

    let jsmockFn = jest.fn();
    const rootCollector = createCollector(jsmockFn);
    observe(data, rootCollector);

    // 访问数据，触发依赖收集
    data.objKey.subObjKey;
    data.primitiveKey;
    (data.arrayKey[0] as any).arraItemKey;

    // 修改数据，触发更新
    data.objKey.subObjKey = 999;
    expect(jsmockFn).toHaveBeenCalledWith({ key: 'subObjKey', oldVal: 1, newVal: 999 });
    data.primitiveKey = 888;
    expect(jsmockFn).toHaveBeenCalledWith({ key: 'primitiveKey', oldVal: 2, newVal: 888 });
    (data.arrayKey[0] as any).arraItemKey = 4;
    expect(jsmockFn).toHaveBeenCalledWith({ key: 'arraItemKey', oldVal: 9, newVal: 4 });
  });
});
