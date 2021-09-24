import { Injectable, InjectableOpts } from './injectable'
import * as Errors from './utils/errors'
import type { Token } from './utils/types'

export class Depsin<T extends Object> {
  private container = new Map<Token, Injectable<any>>()

  get size () {
    return this.container.size
  }

  register<K extends keyof T> (symbol: K, options?: InjectableOpts): Injectable<T[K]> {
    if (this.container.has(symbol)) {
      throw Error(Errors.ALREADY_REGISTER(symbol))
    }

    const injectable = new Injectable<T[K]>({ ...options, identifier: symbol })
    this.container.set(symbol, injectable)

    return injectable
  }

  get<K extends keyof T> (symbol: K): T[K] {
    if (!this.container.has(symbol)) {
      throw Error(Errors.NOT_REGISTER(symbol))
    }

    const injectable = this.container.get(symbol)
    return injectable.get(this)
  }
}
