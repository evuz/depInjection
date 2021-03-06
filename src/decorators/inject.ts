import { IConstructor } from '../utils/types';
import { NO_USE_DEPS } from '../utils/errors';
import { DEPS_SYMBOL } from '../utils/symbols';

export function inject(type: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function(target: IConstructor<any>, _propertyKey: string | symbol, _parameterIndex: number) {
    const deps = target[DEPS_SYMBOL] || [];
    if (!Array.isArray(deps)) {
      throw Error(NO_USE_DEPS);
    }
    target[DEPS_SYMBOL] = [type].concat(deps);
  };
}
