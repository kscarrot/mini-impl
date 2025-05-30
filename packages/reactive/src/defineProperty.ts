import { isPrimitive, isArray } from 'radash';

interface DepInfo {
  key: string;
  oldVal: any;
  newVal: any;
}

interface Collector {
  id: number;
  deps: Set<Collector>;
  addDep(collector: Collector): void;
  update(info: DepInfo): void;
  effect: (info: DepInfo) => void;
}

let uid = 0;

const ObserverSymbol: unique symbol = Symbol('Observer');

class Observer {
  collector: Collector;
  [ObserverSymbol]: boolean = true;
  constructor(obj: object, rootCollector: Collector) {
    this.collector = createCollector(rootCollector.effect);
    if (isArray(obj)) {
      // 数组需要对数组上每个数据绑定响应式
      for (const item of obj) {
        observe(item, rootCollector);
      }
    } else {
      // 对象需要对象上每个值
      for (const key of Object.keys(obj)) {
        defineReactive(obj, key, rootCollector);
      }
    }
  }
}

const isObserver = (obj: any): obj is Observer => obj && obj[ObserverSymbol];

type TCreateCollector = (effect: (info: DepInfo) => void) => Collector;
export const createCollector: TCreateCollector = effect => {
  return {
    id: uid++,
    deps: new Set(),
    addDep(collector: Collector) {
      this.deps.add(collector);
    },
    update(info: DepInfo) {
      effect(info);
      // 通知所有依赖
      this.deps.forEach(dep => dep.update(info));
    },
    effect,
  };
};

export function observe(obj: any, rootCollector: Collector) {
  if (isPrimitive(obj)) {
    return;
  }
  return new Observer(obj, rootCollector);
}

function defineReactive(obj: object, key: string, rootCollector: Collector) {
  const collector = createCollector(rootCollector.effect);
  let value = (obj as Record<string, any>)[key];
  let childObect = observe(value, rootCollector);
  Object.defineProperty(obj, key, {
    get() {
      // 如果有当前活动的收集器，则添加依赖
      if (rootCollector) {
        rootCollector.addDep(collector);
      }
      if (childObect) {
        // 子对象也是对象 同样需要收集依赖
        childObect.collector.addDep(collector);
        if (isArray(value)) {
          for (const item of value) {
            // 数据里可能不是对象，所以需要判断
            if (isObserver(item)) {
              item.collector.addDep(collector);
            }
          }
        }
      }
      return value;
    },
    set(newVal) {
      let oldVal = value;
      if (value === newVal) return;
      // 更新值
      value = newVal;
      // 新值可能是对象 添加观察者
      childObect = observe(newVal, rootCollector);
      // 通知依赖更新
      collector.update({ key, oldVal, newVal });
    },
  });
}
