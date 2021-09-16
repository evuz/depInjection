import { CreateInjectable, InjectableOpts, IConstructor, Inject } from './utils/types'
import { DEPS_SYMBOL } from './utils/symbols'
import * as Errors from './utils/errors'

const defaultOpts: InjectableOpts = { lifetime: 'transient' }

export function createInjectable (params: CreateInjectable) {
  const symbol = params.symbol
  const getDependencie = params.getDependencie
  let opts = Object.assign({}, defaultOpts, params.opts)

  if (!symbol) {
    throw Error(Errors.SYMBOL_REQUIRED)
  }

  if (typeof getDependencie !== 'function') {
    throw Error(Errors.GET_DEP_FUNCTION)
  }

  let inject: Inject = function () {
    throw Error(Errors.DEP_EMPTY(symbol))
  }

  function instanceGenerator (creator: Function, deps: any[]) {
    return function (parents) {
      if (parents.indexOf(symbol) > -1) {
        throw Error(Errors.CIRCULAR_DEPENDENCIES(symbol))
      }
      const args = generateDeps(deps, parents.concat(symbol))
      const instance = creator(args)
      if (opts.lifetime === 'singleton') {
        inject = function () {
          return instance
        }
      }
      return instance
    }
  }

  function generateDeps (deps: string[] = [], parents: string[] = []) {
    return deps.map(dep => getDependencie(dep, parents))
  }

  function asValue (value, o?: InjectableOpts) {
    opts = Object.assign({}, opts, o)
    inject = function () {
      return value
    }

    return injectableModule
  }

  function asClass<T> (Class: IConstructor<T>, o?: InjectableOpts) {
    opts = Object.assign({}, opts, o)
    const deps = Class[DEPS_SYMBOL] || []
    inject = instanceGenerator(function (args) {
      return new Class(...args)
    }, deps)
    return injectableModule
  }

  function asFunction (func: Function, o?: InjectableOpts) {
    opts = Object.assign({}, opts, o)
    const deps = func[DEPS_SYMBOL] || []
    inject = instanceGenerator(function (args) {
      return func(...args)
    }, deps)
    return injectableModule
  }

  function toSingleton () {
    opts.lifetime = 'singleton'
    return injectableModule
  }

  function toTransient () {
    opts.lifetime = 'transient'
    return injectableModule
  }

  function _inject (p: string[]) {
    return inject(p)
  }

  const injectableModule = {
    toSingleton,
    toTransient,
    inject: _inject
  }

  return {
    asValue,
    asFunction,
    asClass,
    inject: _inject
  }
}
