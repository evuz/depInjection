export interface IConstructor<T> {
  new (...args): T;
  deps?: string[];
}

export interface IProviders {
  [e: string]: IConstructor<any> | any;
}
