import { Injectable, InjectableOpts } from './injectable'
import * as Errors from './utils/errors'
import type { Token } from './utils/types'

function createProxy (container: Depsin<any>): any {
  return new Proxy(container, { get: (target, name) => target.get(name) })
}

export class Depsin<T extends Object> {
  private container = new Map<Token, Injectable<any>>()

  proxy: T = createProxy(this)

  get size () {
    return this.container.size
  }

  register<K extends keyof T> (symbol: K, injectable?: InjectableOpts | Injectable<T[K]>): Injectable<T[K]> {
    if (this.container.has(symbol)) {
      throw Error(Errors.ALREADY_REGISTER(symbol))
    }

    if (!(injectable instanceof Injectable)) {
      injectable = new Injectable<T[K]>({ ...injectable, identifier: symbol })
    }

    this.container.set(symbol, injectable)

    return injectable
  }

  get<K extends keyof T> (symbol: K): T[K] {
    if (!this.container.has(symbol)) {
      throw Error(Errors.NOT_REGISTER(symbol))
    }

    const injectable = this.container.get(symbol)
    return injectable.get(this.proxy)
  }
}
