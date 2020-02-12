import { createInjectable } from '../createInjectable';
import { DEPS_SYMBOL } from '../utils/symbols';

class Car {
  static [DEPS_SYMBOL] = ['Wheels', 'Engine'];
  constructor(public wheels: number, private engine) {}
  start() {
    return this.engine.on();
  }
}

function carFn(wheels: number, engine) {
  return {
    start() {
      return engine.on();
    },
    wheels,
  };
}
carFn[DEPS_SYMBOL] = ['Wheels', 'Engine'];

function carProxy({ Wheels: wheels }) {
  return {
    wheels,
  };
}
carProxy[DEPS_SYMBOL] = ['Wheels', 'Engine'];

function deps(container: Object) {
  return function(symbol) {
    return container[symbol];
  };
}

describe('CreateInjectable', () => {
  let container: Object;
  let getter: ReturnType<typeof deps>;

  beforeEach(() => {
    container = {
      Wheels: 4,
      Engine: {
        on: jest.fn(() => 'Start'),
      },
    };
    getter = deps(container);
  });

  test('should create a container', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    expect(injectable).toBeTruthy();
  });

  test('should create a value', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asValue(() => 'VALUE');
    const value: Function = injectable.inject([]);
    expect(value()).toBe('VALUE');
  });

  test('should create a class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asClass(Car);
    const car: Car = injectable.inject([]);
    expect(car.start()).toBe('Start');
    expect(car.wheels).toBe(4);
  });

  test('should create a function', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asFunction(carFn);
    const car: Car = injectable.inject([]);
    expect(car.start()).toBe('Start');
    expect(car.wheels).toBe(4);
  });

  test('should set lifetime transient by default', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asFunction(carFn);
    const firstCar: Car = injectable.inject([]);
    const secondCar: Car = injectable.inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).not.toBe(secondCar);
  });

  test('should create a transient class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main', opts: { lifetime: 'transient' } });
    injectable.asClass(Car);
    const firstCar: Car = injectable.inject([]);
    const secondCar: Car = injectable.inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).not.toBe(secondCar);
  });

  test('should create a singleton class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main', opts: { lifetime: 'singleton' } });
    injectable.asClass(Car);
    const firstCar: Car = injectable.inject([]);
    const secondCar: Car = injectable.inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).toBe(secondCar);
  });

  test('should set lifetime when set class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asClass(Car, { lifetime: 'singleton' });
    const firstCar: Car = injectable.inject([]);
    const secondCar: Car = injectable.inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).toBe(secondCar);
  });

  test('should set lifetime with toSingleton', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asClass(Car).toSingleton();
    const firstCar: Car = injectable.inject([]);
    const secondCar: Car = injectable.inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).toBe(secondCar);
  });

  test('should set lifetime with toTransient', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main', opts: { lifetime: 'singleton' } });
    injectable.asClass(Car).toTransient();
    const firstCar: Car = injectable.inject([]);
    const secondCar: Car = injectable.inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).not.toBe(secondCar);
  });

  test('should set lifetime when set function', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asFunction(carFn, { lifetime: 'singleton' });
    const firstCar: Car = injectable.inject([]);
    const secondCar: Car = injectable.inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).toBe(secondCar);
  });

  test('should inject function like proxy', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asFunction(carProxy, { lifetime: 'singleton', injectionMode: 'proxy' });
    const myCar: ReturnType<typeof carProxy> = injectable.inject([]);
    expect(myCar.wheels).toBe(4);
    expect(container['Engine'].on).not.toHaveBeenCalled();
  });
});
