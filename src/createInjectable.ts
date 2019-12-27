import { CreateInjectable, InjectableOpts, IConstructor, Inject } from './utils/types';
import { DEPS_SYMBOL } from './utils/symbols';
import * as Errors from './utils/errors';

const defaultOpts: InjectableOpts = { lifetime: 'transient' };

export function createInjectable(params: CreateInjectable) {
  const symbol = params.symbol;
  const getDependencie = params.getDependencie;
  let opts = Object.assign({}, defaultOpts, params.opts);

  if (!symbol) {
    throw Error(Errors.SYMBOL_REQUIRED);
  }

  if (typeof getDependencie !== 'function') {
    throw Error(Errors.GET_DEP_FUNCTION);
  }

  let inject: Inject = function() {
    throw Error(Errors.DEP_EMPTY(symbol));
  };

  function generateDeps(deps: string[], parents: string[]) {
    return deps.map(dep => getDependencie(dep, parents));
  }

  function asValue(value, o?: InjectableOpts) {
    opts = Object.assign({}, opts, o);
    inject = function() {
      return value;
    };

    return injectableModule;
  }

  function asClass<T>(Class: IConstructor<T>, o?: InjectableOpts) {
    opts = Object.assign({}, opts, o);
    inject = parents => {
      if (parents.indexOf(symbol) > -1) {
        throw Error(Errors.CIRCULAR_DEPENDENCIES(symbol));
      }
      const args = generateDeps(Class[DEPS_SYMBOL] || [], parents.concat(symbol));
      const instance = new Class(...args);
      if (opts.lifetime === 'singleton') {
        inject = function() {
          return instance;
        };
      }
      return instance;
    };
    return injectableModule;
  }

  function toSingleton() {
    opts.lifetime = 'singleton';
  }

  function toTransient() {
    opts.lifetime = 'transient';
  }

  const injectableModule = {
    toSingleton,
    toTransient,
  };

  return {
    asValue,
    asClass,
    _inject: (p: string[]) => inject(p),
  };
}
