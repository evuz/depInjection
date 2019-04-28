import { IConstructor } from './types';
import * as ERRORS from './errors';

export class DepInjection {
  private container = new Map<string, (parents?: string[]) => any>();

  public get<T>(type: string): T {
    return this.getInstance(type, []);
  }

  public register<T>(type: string, Injectable: IConstructor<T>): DepInjection {
    if (this.container.has(type)) {
      throw Error(ERRORS.ALREADY_REGISTER(type));
    }

    this.container.set(type, parents => {
      if (parents.indexOf(type) > -1) {
        throw Error(ERRORS.CIRCULAR_DEPENDENCIES(type));
      }
      const args = this.generateDeps(Injectable.deps || [], parents.concat(type));
      const instance = new Injectable(...args);
      this.container.set(type, function() {
        return instance;
      });
      return instance;
    });
    return this;
  }

  private generateDeps(deps: string[], parents: string[]) {
    return deps.map(key => this.getInstance(key, parents));
  }

  private getInstance<T>(type: string, parents: string[]): T {
    const wrapper = this.container.get(type);
    if (!wrapper) {
      throw Error(ERRORS.NOT_REGISTER(type));
    }
    return wrapper(parents);
  }
}
