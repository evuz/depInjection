import { IConstructor, Depsin, IProviders, IProviderClass, IProviderValue } from './types';
import { DEPS_SYMBOL } from './symbols';
import * as Errors from './errors';

export function createContainer(providers?: IProviders): Depsin {
  const container = {};
  let count = 0;

  if (providers) {
    Object.keys(providers).forEach(key => {
      const value = providers[key];
      if ((<IProviderClass>value).asClass) {
        register(key, (<IProviderClass>value).asClass);
      }
      if ((<IProviderValue>value).asValue) {
        set(key, (<IProviderValue>value).asValue);
      }
    });
  }

  function generateDeps(deps: string[], parents: string[]) {
    return deps.map(key => getInstance(key, parents));
  }

  function getInstance<T>(type: string, parents: string[]): T {
    const wrapper = container[type];
    if (!wrapper) {
      throw Error(Errors.NOT_REGISTER(type));
    }
    return wrapper(parents);
  }

  function register<T>(type: string, Injectable: IConstructor<T>): Depsin {
    if (container[type]) {
      throw Error(Errors.ALREADY_REGISTER(type));
    }

    container[type] = parents => {
      if (parents.indexOf(type) > -1) {
        throw Error(Errors.CIRCULAR_DEPENDENCIES(type));
      }
      const args = generateDeps(Injectable[DEPS_SYMBOL] || [], parents.concat(type));
      const instance = new Injectable(...args);
      container[type] = function() {
        return instance;
      };
      return instance;
    };
    count = count + 1;
    return module;
  }

  function set(type: string, value): Depsin {
    if (container[type]) {
      throw Error(Errors.ALREADY_REGISTER(type));
    }
    container[type] = function() {
      return value;
    };
    count = count + 1;
    return module;
  }

  function get<T>(type: string): T {
    return getInstance(type, []);
  }

  function size(): number {
    return count;
  }

  const module = {
    register,
    get,
    set,
    size,
  };

  return module;
}
