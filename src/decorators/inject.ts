import { IConstructor } from '../types';
import { NO_USE_DEPS } from '../errors';

export function inject(type: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function(target: IConstructor<any>, _propertyKey: string | symbol, _parameterIndex: number) {
    const deps = target.deps || [];
    if (!Array.isArray(deps)) {
      throw Error(NO_USE_DEPS);
    }
    target.deps = [type].concat(deps);
  };
}
