import { DepInjection } from '../depInjection';

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
  public static deps = [TYPES.foo];
  constructor(public foo: Foo) {}
  public action() {
    this.foo.action();
    return true;
  }
}

class Baz {
  public static deps = [TYPES.bar];
  constructor(public foo: Foo) {}
  public action() {
    this.foo.action();
  }
}

class Qux {}

class CircularFoo {
  public static deps = [TYPES.baz];
}

class CircularBar {
  public static deps = [TYPES.foo];
}

class CircularBaz {
  public static deps = [TYPES.bar];
}

describe('DepInjection', () => {
  let container: DepInjection;

  beforeEach(() => {
    container = new DepInjection({
      [TYPES.foo]: Foo,
      [TYPES.bar]: Bar,
      [TYPES.baz]: Baz,
    });
  });

  test('should create a depInjection instance', () => {
    const depInjection = new DepInjection();
    expect(depInjection).toBeTruthy();
    expect(depInjection instanceof DepInjection).toBeTruthy();
  });

  test('should register class', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((container as any).container.size).toEqual(3);
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
    const circular = new DepInjection()
      .register(TYPES.foo, CircularFoo)
      .register(TYPES.bar, CircularBar)
      .register(TYPES.baz, CircularBaz);
    function getFoo() {
      circular.get(TYPES.foo);
    }
    expect(getFoo).toThrowError('circular');
  });
});
