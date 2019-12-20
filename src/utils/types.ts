export interface IConstructor<T> {
  new (...args): T;
  deps?: string[];
}

export interface IProviderClass {
  asClass: IConstructor<any>;
}

export interface IProviderValue {
  asValue: IConstructor<any>;
}

export interface IProviders {
  [e: string]: IProviderClass | IProviderValue;
}

export interface Depsin {
  register: <T>(type: string, Injectable: IConstructor<T>) => Depsin;
  size: () => number;
  get: <T>(type: string) => T;
  set: (type: string, value) => Depsin;
}
