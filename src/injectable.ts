import { DEPS_SYMBOL } from './utils/symbols'
import * as Errors from './utils/errors'
import type { IConstructor, Token } from './utils/types'

type LifetimeOpts = 'transient' | 'singleton'

export type InjectableOpts = {
  lifetime?: LifetimeOpts
};

export type CreateInjectableOpts = InjectableOpts & {
  identifier?: Token,
}

const parents = new Map<symbol, boolean>()
const defaultCtor: CreateInjectableOpts = { lifetime: 'transient' }

export class Injectable<T = unknown> {
  private options: InjectableOpts
  private deps: Token[]
  private initializer: Function
  private identifier: Token | undefined
  private symbol: symbol

  get description () {
    return this.identifier || this.symbol
  }

  constructor (opts?: CreateInjectableOpts)
  constructor (deps: Token[], opts?: CreateInjectableOpts)
  constructor (a: any, b: any = defaultCtor) {
    let deps: Token[] = a
    let opts: CreateInjectableOpts = b

    if (!Array.isArray(deps)) {
      deps = undefined
      opts = a || opts
    }

    const { lifetime, identifier } = opts

    this.options = { lifetime }
    this.deps = deps
    this.identifier = identifier
    this.symbol = Symbol('Injectable')
  }

  get (container: Record<Token, any>): T {
    if (!this.initializer) {
      throw Error(Errors.DEP_EMPTY(this.description))
    }

    if (parents.get(this.symbol) === true) {
      throw Error(Errors.CIRCULAR_DEPENDENCIES(this.description))
    }

    parents.set(this.symbol, true)

    const deps = (this.deps || []).map(dep => container[dep])
    deps.push(container)
    const instance = this.initializer(deps)

    if (this.options.lifetime === 'singleton') {
      this.initializer = function () {
        return instance
      }
    }

    parents.set(this.symbol, false)

    return instance
  }

  asValue (value: T): Injectable<T> {
    this.initializer = function () {
      return value
    }
    return this
  }

  asFunction (fn: (...args:any) => T): Injectable<T> {
    this.deps = this.deps || fn[DEPS_SYMBOL]
    this.initializer = function (args) {
      return fn(...args)
    }
    return this
  }

  asClass (Class: IConstructor<T>): Injectable<T> {
    this.deps = this.deps || Class[DEPS_SYMBOL]
    this.initializer = function (args) {
      return new Class(...args)
    }
    return this
  }

  toSingleton (): Injectable<T> {
    this.options.lifetime = 'singleton'
    return this
  }

  toTransient (): Injectable<T> {
    this.options.lifetime = 'transient'
    return this
  }
}
