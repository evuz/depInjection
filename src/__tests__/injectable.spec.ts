import { Injectable } from '../injectable'
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

describe('Injectable', () => {
  let container: any

  beforeEach(() => {
    container = {
      Wheels: 4,
      Engine: { on: () => 'Start' }
    }
  })

  test('should create a container', () => {
    const injectable = new Injectable()
    expect(injectable).toBeTruthy()
  })

  test('should create a value', () => {
    const injectableValue = 'VALUE'
    const injectable = new Injectable<() => string>().asValue(() => injectableValue)
    const value = injectable.get(container)
    expect(value()).toBe(injectableValue)
  })

  test('should create a class', () => {
    const injectable = new Injectable<Car>()
    injectable.asClass(Car)
    const car = injectable.get(container)
    expect(car.start()).toBe('Start')
    expect(car.wheels).toBe(4)
  })

  test('should create a function', () => {
    const injectable = new Injectable<Car>().asFunction(carFn)
    const car = injectable.get(container)
    expect(car.start()).toBe('Start')
    expect(car.wheels).toBe(4)
  })

  test('should create override deps', () => {
    (<any>container).specialWheels = 2
    const injectable = new Injectable<Car>({ deps: ['specialWheels', 'Engine'] }).asFunction(carFn)
    const car = injectable.get(container)

    expect(car.start()).toBe('Start')
    expect(car.wheels).not.toBe(4)
    expect(car.wheels).toBe(2)
  })

  test('should add container like last dependency', () => {
    function foo (...args: any[]) {
      return args
    }
    const injectable = new Injectable<any[]>({ deps: ['Wheels'] }).asFunction(foo)
    const instance = injectable.get(container)

    expect(instance[0]).toBe(4)
    expect(instance[1]).toBe(container)
  })

  test('should set lifetime transient by default', () => {
    const injectable = new Injectable<Car>().asFunction(carFn)
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).not.toBe(secondCar)
  })

  test('should create singleton injectable', () => {
    const injectable = new Injectable<Car>({ lifetime: 'singleton' }).asClass(Car)
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).toBe(secondCar)
  })

  test('should set singleton lifetime', () => {
    const injectable = new Injectable<Car>().asClass(Car).toSingleton()
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).toBe(secondCar)
  })

  test('should set transient lifetime', () => {
    const injectable = new Injectable<Car>().asClass(Car).toTransient()
    const firstCar: Car = injectable.get(container)
    const secondCar: Car = injectable.get(container)

    expect(firstCar.start()).toBe('Start')
    expect(firstCar.wheels).toBe(4)

    expect(secondCar.start()).toBe('Start')
    expect(secondCar.wheels).toBe(4)

    expect(firstCar).not.toBe(secondCar)
  })

  test('should throw error with random symbol', () => {
    const injectable = new Injectable<Car>()

    function error () {
      injectable.get(container)
    }

    expect(error).toThrowError('Symbol')
  })

  test('should throw error with identifier', () => {
    const injectable = new Injectable<Car>({ identifier: 'Car' })

    function error () {
      injectable.get(container)
    }

    expect(error).toThrowError('Car')
  })
})
