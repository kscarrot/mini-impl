import { Option } from './option.ts';

describe('Option', () => {
  it('should create a some value', () => {
    const option = Option.some(1);
    expect(option.unwrap()).toBe(1);
  });

  it('should create a none value', () => {
    const option = Option.none();
    expect(() => option.unwrap()).toThrow('Called unwrap on None value');
  });

  it('测试单位律', () => {
    const id = (value: number) => value;
    const option = Option.some(1);
    expect(option.map(id).unwrap()).toBe(1);
  });

  it('测试结合律', () => {
    const option = Option.some(1);
    const result = option.map(value => value + 1).map(value => value + 1);
    expect(result.unwrap()).toBe(3);
  });

  it('嵌套Option', () => {
    const option = Option.some(Option.some(1));
    expect(option.unwrap()).toBe(1);
  });

  it('map', () => {
    const option = Option.some(Option.some(1));
    const result = option.map(value => value + 1);
    expect(result.unwrap()).toBe(2);
  });

  it('map fp', () => {
    const option = Option.some(Option.some(1));
    const add1 = (value: number) => value + 1;
    const add2 = (value: number) => value + 2;
    const multiply = (value: number) => value * 2;
    const result = option.map(add1).map(add2).map(multiply);
    expect(result.unwrap()).toBe(8);
  });

  it('flatMap', () => {
    const option = Option.some(Option.some(1));
    const result = option.flatMap(value => Option.some(value + 1));
    expect(result.unwrap()).toBe(2);
  });
});
