export class Option<T> {
  private value: T | null;

  private constructor(value: T | null) {
    this.value = value;
  }

  static some<T>(value: T | Option<T>): Option<T> {
    if (value instanceof Option) {
      return value;
    }
    return new Option(value);
  }

  static none<T>(): Option<T> {
    return new Option<T>(null);
  }

  unwrap(): T {
    if (this.value === null) {
      throw new Error('Called unwrap on None value');
    }
    return this.value;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return this.value === null ? Option.none<U>() : Option.some(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    return this.value === null ? Option.none<U>() : fn(this.value);
  }
}
