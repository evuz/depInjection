export interface IConstructor<T> {
  new (...args: any[]): T;
  deps?: string[];
}

export type Token = string | number | symbol
