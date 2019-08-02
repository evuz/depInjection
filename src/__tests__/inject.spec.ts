import { inject } from '../decorators/inject';
import { IConstructor } from '../types';

const TYPES = {
  foo: 'Foo',
  bar: 'Bar',
};

class Bar {
  constructor(@inject(TYPES.bar) public bar, @inject(TYPES.foo) public foo) {}
  public action() {
    this.foo.action();
  }
}

describe('@inject', () => {
  test('should create a deps property', () => {
    expect((Bar as IConstructor<Bar>).deps).toContain(TYPES.foo);
    expect((Bar as IConstructor<Bar>).deps).toContain(TYPES.bar);
  });

  test('should create a deps property in order', () => {
    expect((Bar as IConstructor<Bar>).deps[0]).toBe(TYPES.bar);
  });
});
