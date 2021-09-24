import { Depsin } from './container'

export function createContainer<T> (): Depsin<T> {
  return new Depsin<T>()
}
