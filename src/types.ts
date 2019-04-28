export interface IConstructor<T> {
  new (...args): T;
  deps?: string[];
}
