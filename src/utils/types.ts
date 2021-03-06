import { createInjectable } from '../createInjectable';
import { createContainer } from '../createContainer';

export interface IConstructor<T> {
  new (...args): T;
  deps?: string[];
}

export type Injectable = ReturnType<typeof createInjectable>;
export type Inject = (parents: string[]) => any;
export type Container = ReturnType<typeof createContainer>;

export interface CreateInjectable {
  symbol: string;
  getDependencie: (symbol: string, parents: string[]) => any;
  opts?: InjectableOpts;
}

export interface InjectableOpts {
  lifetime: 'transient' | 'singleton';
}

export interface IProviderClass {
  asClass: IConstructor<any>;
}

export interface IProviderValue {
  asValue: any;
}

export interface IProviderFunction {
  asFunction: Function;
}

export interface IProviders {
  [e: string]: IProviderClass | IProviderValue | IProviderFunction;
}
