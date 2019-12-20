import { createContainer } from '../createContainer';
import { DEPS_SYMBOL } from '../symbols';
import { Depsin } from '../types';

const TYPES = {
  foo: 'Foo',
  bar: 'Bar',
  baz: 'Baz',
  qux: 'Qux',
};

class Foo {
  public action = jest.fn();
}

class Bar {
  public static [DEPS_SYMBOL] = [TYPES.foo];
  constructor(public foo: Foo) {}
  public action() {
    this.foo.action();
    return true;
  }
}

class Baz {
  public static [DEPS_SYMBOL] = [TYPES.bar];
  constructor(public foo: Foo) {}
  public action() {
    this.foo.action();
  }
}

class Qux {}

class CircularFoo {
  public static [DEPS_SYMBOL] = [TYPES.baz];
}

class CircularBar {
  public static [DEPS_SYMBOL] = [TYPES.foo];
}

class CircularBaz {
  public static [DEPS_SYMBOL] = [TYPES.bar];
}

describe('DepInjection', () => {
  let container: Depsin;

  beforeEach(() => {
    container = createContainer({
      [TYPES.foo]: { asClass: Foo },
      [TYPES.bar]: { asClass: Bar },
      [TYPES.baz]: { asClass: Baz },
    });
  });

  test('should create a container', () => {
    expect(container).toBeTruthy();
  });

  test('should register class', () => {
    expect(container.size()).toEqual(3);
  });

  test('should create a Foo instance', () => {
    const bar = container.get<Bar>(TYPES.bar);
    bar.action();
    expect(bar.foo instanceof Foo).toBeTruthy();
  });

  test('should register a new class', () => {
    function error() {
      return container.get<Qux>(TYPES.qux);
    }
    expect(error).toThrowError('not register');
    container.register(TYPES.qux, Qux);
    const qux = container.get<Qux>(TYPES.qux);
    expect(qux instanceof Qux).toBeTruthy();
  });

  test('should create only one Foo instance', () => {
    const bar = container.get<Bar>(TYPES.bar);
    const baz = container.get<Baz>(TYPES.baz);
    const foo = container.get<Foo>(TYPES.foo);
    bar.action();
    baz.action();
    expect(foo.action).toHaveBeenCalledTimes(2);
  });

  test('should throw circular dependencies error', () => {
    const circular = createContainer()
      .register(TYPES.foo, CircularFoo)
      .register(TYPES.bar, CircularBar)
      .register(TYPES.baz, CircularBaz);
    function getFoo() {
      circular.get(TYPES.foo);
    }
    expect(getFoo).toThrowError('circular');
  });
});
