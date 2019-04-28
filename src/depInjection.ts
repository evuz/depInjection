import { IConstructor } from './types';

export class DepInjection {
  private container = new Map<string, () => any>();

  public get<T>(type: string): T {
    const wrapper = this.container.get(type);
    if (!wrapper) {
      // TODO: Error
      throw Error();
    }
    return wrapper();
  }

  public register<T>(type: string, Injectable: IConstructor<T>): DepInjection {
    this.container.set(type, () => {
      const args = this.generateDeps(Injectable.deps || []);
      const instance = new Injectable(...args);
      this.container.set(type, function() {
        return instance;
      });
      return instance;
    });
    return this;
  }

  private generateDeps(deps: string[]) {
    return deps.map(key => this.get(key));
  }
}
