import { createInjectable } from './createInjectable';
import {
  IProviders,
  IProviderClass,
  IProviderValue,
  InjectableOpts,
  Injectable,
  IProviderFunction,
} from './utils/types';
import * as Errors from './utils/errors';

export function createContainer(providers?: IProviders, opts?: InjectableOpts) {
  const container = {};

  if (providers) {
    Object.keys(providers).forEach(key => {
      const value = providers[key];
      if ((<IProviderClass>value).asClass) {
        register(key, opts).asClass((<IProviderClass>value).asClass);
      }
      if ((<IProviderFunction>value).asFunction) {
        register(key, opts).asFunction((<IProviderFunction>value).asFunction);
      }
      if ((<IProviderValue>value).asValue) {
        register(key, opts).asValue((<IProviderValue>value).asValue);
      }
    });
  }

  function getInstance<T>(symbol: string, parents: string[]): T {
    const wrapper = container[symbol];
    if (!wrapper) {
      throw Error(Errors.NOT_REGISTER(symbol));
    }
    return wrapper(parents);
  }

  function register(symbol: string, opts?: InjectableOpts) {
    if (container[symbol]) {
      throw Error(Errors.ALREADY_REGISTER(symbol));
    }
    const injectable = createInjectable({ symbol, opts, getDependencie: getInstance });
    container[symbol] = injectable._inject;
    return Object.keys(injectable).reduce((acc, key) => {
      if (!key.startsWith('_')) {
        acc[key] = injectable[key];
      }
      return acc;
    }, <Injectable>{});
  }

  function get<T>(symbol: string): T {
    return getInstance(symbol, []);
  }

  function size(): number {
    return Object.keys(container).length;
  }

  return {
    register,
    get,
    size,
  };
}
