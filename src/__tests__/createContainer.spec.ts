import { createContainer } from '../createContainer';
import { DEPS_SYMBOL } from '../utils/symbols';
import { Container } from '../utils/types';

const TYPES = {
  foo: 'Foo',
  bar: 'Bar',
  baz: 'Baz',
  qux: 'Qux',
  quux: 'Quux',
  corge: 'Corge',
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

function Baz(foo: Foo) {
  return {
    action() {
      foo.action();
    },
  };
}
Baz[DEPS_SYMBOL] = [TYPES.foo];

class Qux {}

class Quux {
  public static [DEPS_SYMBOL] = [TYPES.foo, TYPES.bar];
  constructor(public foo: number, public bar: string) {}
}

function corge(timeout: number) {
  return { timeout };
}
corge[DEPS_SYMBOL] = ['timeout'];

class CircularFoo {
  public static [DEPS_SYMBOL] = [TYPES.baz];
}

class CircularBar {
  public static [DEPS_SYMBOL] = [TYPES.foo];
}

function CircularBaz() {}
CircularBaz[DEPS_SYMBOL] = [TYPES.bar];

describe('CreateContainer', () => {
  let container: Container;

  beforeEach(() => {
    container = createContainer({
      [TYPES.foo]: { asClass: Foo },
      [TYPES.bar]: { asClass: Bar },
      [TYPES.baz]: { asFunction: Baz },
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
    container.register(TYPES.qux).asClass(Qux);

    const qux = container.get<Qux>(TYPES.qux);
    expect(qux instanceof Qux).toBeTruthy();
  });

  test('should register a function', () => {
    function error() {
      return container.get(TYPES.corge);
    }
    expect(error).toThrowError('not register');
    container.register(TYPES.corge).asFunction(corge);
    container.register('timeout').asValue(1000);

    const dep = container.get<any>(TYPES.corge);
    expect(dep).toBeTruthy();
    expect(dep.timeout).toBe(1000);
  });

  test('should register class and value', () => {
    container = createContainer({
      [TYPES.quux]: { asClass: Quux },
      [TYPES.foo]: { asValue: 3 },
    });
    container.register(TYPES.bar).asValue('value');

    const quux = container.get<Quux>(TYPES.quux);
    expect(quux.foo).toBe(3);
    expect(quux.bar).toBe('value');
  });

  test('should create only one Foo instance', () => {
    container = createContainer(
      {
        [TYPES.foo]: { asClass: Foo },
        [TYPES.bar]: { asClass: Bar },
        [TYPES.baz]: { asFunction: Baz },
      },
      { lifetime: 'singleton' },
    );

    const bar = container.get<Bar>(TYPES.bar);
    const baz = container.get<ReturnType<typeof Baz>>(TYPES.baz);
    const foo = container.get<Foo>(TYPES.foo);
    bar.action();
    baz.action();

    expect(foo.action).toHaveBeenCalledTimes(2);
  });

  test('should create only one Foo instance when register symbol', () => {
    container = createContainer({
      [TYPES.bar]: { asClass: Bar },
      [TYPES.baz]: { asFunction: Baz },
    });
    container.register(TYPES.foo).asClass(Foo, { lifetime: 'singleton' });

    const bar = container.get<Bar>(TYPES.bar);
    const baz = container.get<ReturnType<typeof Baz>>(TYPES.baz);
    const foo = container.get<Foo>(TYPES.foo);
    bar.action();
    baz.action();

    expect(foo.action).toHaveBeenCalledTimes(2);
  });

  test('should throw circular dependencies error', () => {
    const circular = createContainer();
    circular.register(TYPES.foo).asClass(CircularFoo);
    circular.register(TYPES.bar).asClass(CircularBar);
    circular.register(TYPES.baz).asFunction(CircularBaz);

    function getFoo() {
      circular.get(TYPES.foo);
    }

    expect(getFoo).toThrowError('circular');
  });
});
