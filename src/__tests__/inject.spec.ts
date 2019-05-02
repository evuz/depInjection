import { inject } from '../decorators/inject';
import { IConstructor } from '../types';

const TYPES = {
  foo: 'Foo',
};

class Bar {
  constructor(@inject(TYPES.foo) public foo) {}
  public action() {
    this.foo.action();
  }
}

describe('@inject', () => {
  test('should create a deps property', () => {
    expect((Bar as IConstructor<Bar>).deps).toContain(TYPES.foo);
  });
});
