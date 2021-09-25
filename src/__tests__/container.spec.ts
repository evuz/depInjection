import { Depsin } from '../container'
import { DEPS_SYMBOL } from '../utils/symbols'

const TYPES = {
  foo: 'Foo',
  bar: 'Bar',
  baz: 'Baz',
  qux: 'Qux',
  quux: 'Quux',
  corge: 'Corge'
} as const

class Foo {
  public action = jest.fn();
}

class Bar {
  public static [DEPS_SYMBOL] = [TYPES.foo];
  constructor (public foo: Foo) {}
  public action () {
    this.foo.action()
    return true
  }
}

function Baz (foo: Foo) {
  return {
    action () {
      foo.action()
    }
  }
}
Baz[DEPS_SYMBOL] = [TYPES.foo]

class Qux {}

class Quux {
  public static [DEPS_SYMBOL] = [TYPES.foo, TYPES.bar];
  constructor (public foo: number, public bar: string) {}
}

function corge (timeout: number) {
  return { timeout }
}
corge[DEPS_SYMBOL] = ['timeout']

class CircularFoo {
  public static [DEPS_SYMBOL] = [TYPES.baz];
}

class CircularBar {
  public static [DEPS_SYMBOL] = [TYPES.foo];
}

function CircularBaz () {}
CircularBaz[DEPS_SYMBOL] = [TYPES.bar]

type Container = {
  Foo: Foo
  Bar: Bar
  Baz: ReturnType<typeof Baz>
  Qux: Qux
  Quux: Quux
  Corge: ReturnType<typeof corge>
  timeout: number
}

describe('Depsin container', () => {
  let container: Depsin<Container>

  beforeEach(() => {
    container = new Depsin()
    container.register(TYPES.foo).asClass(Foo)
    container.register(TYPES.bar).asClass(Bar)
    container.register(TYPES.baz).asFunction(Baz)
  })

  test('should create a container', () => {
    expect(container).toBeTruthy()
  })

  test('should register class', () => {
    expect(container.size).toEqual(3)
  })

  test('should create a Foo instance', () => {
    const bar = container.get(TYPES.bar)
    bar.action()

    expect(bar.foo instanceof Foo).toBeTruthy()
  })

  test('should register a new class', () => {
    function error () {
      return container.get(TYPES.qux)
    }
    expect(error).toThrowError('not register')
    container.register(TYPES.qux).asClass(Qux)

    const qux = container.get(TYPES.qux)
    expect(qux instanceof Qux).toBeTruthy()
  })

  test('should register a function', () => {
    function error () {
      return container.get(TYPES.corge)
    }

    expect(error).toThrowError('not register')
    container.register(TYPES.corge).asFunction(corge)
    container.register('timeout').asValue(1000)

    const dep = container.get<any>(TYPES.corge)
    expect(dep).toBeTruthy()
    expect(dep.timeout).toBe(1000)
  })

  test('should register class and value', () => {
    const container = new Depsin<any>()
    container.register(TYPES.quux).asClass(Quux)
    container.register(TYPES.foo).asValue(3)
    container.register(TYPES.bar).asValue('value')

    const quux = container.get(TYPES.quux)
    expect(quux.foo).toBe(3)
    expect(quux.bar).toBe('value')
  })

  test('should instance proxy', () => {
    type Container = {
      [TYPES.quux]: Quux
      [TYPES.foo] : number
      [TYPES.bar] : string
    }
    const container = new Depsin<Container>()
    container.register(TYPES.quux).asClass(Quux)
    container.register(TYPES.foo).asValue(3)
    container.register(TYPES.bar).asValue('value')

    const proxy = container.proxy

    const quux = proxy[TYPES.quux]
    expect(quux.foo).toBe(3)
    expect(quux.bar).toBe('value')
  })

  test('should create only one Foo instance', () => {
    const container = new Depsin<any>()
    container.register(TYPES.foo).asClass(Foo).toSingleton()
    container.register(TYPES.bar).asClass(Bar).toSingleton()
    container.register(TYPES.baz).asFunction(Baz).toSingleton()

    const bar = container.get(TYPES.bar)
    const baz = container.get(TYPES.baz)
    const foo = container.get(TYPES.foo)
    bar.action()
    baz.action()

    expect(foo.action).toHaveBeenCalledTimes(2)
  })

  test('should create only one Foo instance when register symbol', () => {
    const container = new Depsin<any>()
    container.register(TYPES.bar).asClass(Bar)
    container.register(TYPES.baz).asFunction(Baz)
    container.register(TYPES.foo).asClass(Foo).toSingleton()

    const bar = container.get(TYPES.bar)
    const baz = container.get(TYPES.baz)
    const foo = container.get(TYPES.foo)
    bar.action()
    baz.action()

    expect(foo.action).toHaveBeenCalledTimes(2)
  })

  test('should throw circular dependencies error', () => {
    const circular = new Depsin<any>()
    circular.register(TYPES.foo).asClass(CircularFoo)
    circular.register(TYPES.bar).asClass(CircularBar)
    circular.register(TYPES.baz).asFunction(CircularBaz)

    function getFoo () {
      circular.get(TYPES.foo)
    }

    expect(getFoo).toThrowError('circular')
  })
})
