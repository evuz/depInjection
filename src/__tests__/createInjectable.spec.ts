import { createInjectable } from '../createInjectable';
import { DEPS_SYMBOL } from '../utils/symbols';

class Car {
  static [DEPS_SYMBOL] = ['Wheels', 'Engine'];
  constructor(public wheels: number, private engine) {}
  start() {
    return this.engine.on();
  }
}

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
        on: () => 'Start',
      },
    };
    getter = deps(container);
  });

  test('should create a container', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    expect(injectable).toBeTruthy();
  });

  test('should create a class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asClass(Car);
    const car: Car = injectable._inject([]);
    expect(car.start()).toBe('Start');
    expect(car.wheels).toBe(4);
  });

  test('should create a value', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asValue(() => 'VALUE');
    const value: Function = injectable._inject([]);
    expect(value()).toBe('VALUE');
  });

  test('should create a transient class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asClass(Car);
    const firstCar: Car = injectable._inject([]);
    const secondCar: Car = injectable._inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).not.toBe(secondCar);
  });

  test('should create a singleton class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main', opts: { lifetime: 'singleton' } });
    injectable.asClass(Car);
    const firstCar: Car = injectable._inject([]);
    const secondCar: Car = injectable._inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).toBe(secondCar);
  });

  test('should set lifetime when set class', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asClass(Car, { lifetime: 'singleton' });
    const firstCar: Car = injectable._inject([]);
    const secondCar: Car = injectable._inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).toBe(secondCar);
  });

  test('should set lifetime with toSingleton', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main' });
    injectable.asClass(Car).toSingleton();
    const firstCar: Car = injectable._inject([]);
    const secondCar: Car = injectable._inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).toBe(secondCar);
  });

  test('should set lifetime with toTransient', () => {
    const injectable = createInjectable({ getDependencie: getter, symbol: 'Main', opts: { lifetime: 'singleton' } });
    injectable.asClass(Car).toTransient();
    const firstCar: Car = injectable._inject([]);
    const secondCar: Car = injectable._inject([]);

    expect(firstCar.start()).toBe('Start');
    expect(firstCar.wheels).toBe(4);

    expect(secondCar.start()).toBe('Start');
    expect(secondCar.wheels).toBe(4);

    expect(firstCar).not.toBe(secondCar);
  });
});
