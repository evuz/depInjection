import { Depsin } from '../container'
import { createInjectable } from '../createInjectable'
import { DEPS_SYMBOL } from '../utils/symbols'

class Car {
  static [DEPS_SYMBOL] = ['Wheels', 'Engine'];
  constructor (public wheels: number, private engine) {}
  start () {
    return this.engine.on()
  }
}

function carFn (wheels: number, engine): Car {
  return new Car(wheels, engine)
}
carFn[DEPS_SYMBOL] = ['Wheels', 'Engine']

describe('CreateInjectable', () => {
  let container: Depsin<any>

  beforeEach(() => {
    container = new Depsin()
    container.register('Wheels').asValue(4)
    container.register('Engine').asValue({
      on: () => 'Start'
    })
  })

  test('should create a container', () => {
    const injectable = createInjectable()
    expect(injectable).toBeTruthy()
  })

  test('should create a value', () => {
    const injectableValue = 'VALUE'
    const injectable = createInjectable<() => string>().asValue(() => injectableValue)
    const value = injectable.get(container)
    expect(value()).toBe(injectableValue)
  })

  test('should create a class', () => {
    const injectable = createInjectable<Car>()
    injectable.asClass(Car)
    const car = injectable.get(container)
    expect(car.start()).toBe('Start')
    expect(car.wheels).toBe(4)
  })

  test('should create a function', () => {
    const injectable = createInjectable<Car>().asFunction(carFn)
    const car = injectable.get(container)
    expect(car.start()).toBe('Start')
    expect(car.wheels).toBe(4)
  })

  test('should set lifetime transient by default', () => {
    const injectable = createInjectable<Car>().asFunction(carFn)
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).not.toBe(secondCar)
  })

  test('should create singleton injectable', () => {
    const injectable = createInjectable<Car>({ lifetime: 'singleton' }).asClass(Car)
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).toBe(secondCar)
  })

  test('should set singleton lifetime', () => {
    const injectable = createInjectable<Car>().asClass(Car).toSingleton()
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).toBe(secondCar)
  })

  test('should set transient lifetime', () => {
    const injectable = createInjectable<Car>().asClass(Car).toTransient()
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).not.toBe(secondCar)
  })

  test('should throw error with random symbol', () => {
    const injectable = createInjectable<Car>()

    function error () {
      injectable.get(container)
    }

    expect(error).toThrowError('Symbol')
  })

  test('should throw error with identifier', () => {
    const injectable = createInjectable<Car>({ identifier: 'Car' })

    function error () {
      injectable.get(container)
    }

    expect(error).toThrowError('Car')
  })
})
