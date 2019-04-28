export interface IConstructor<T, U extends any[] = []> {
  new (...args: U | never[]): T;
}
