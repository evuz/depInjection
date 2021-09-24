import { Injectable, CreateInjectable } from './injectable'

export function createInjectable<T = unknown> (params?: CreateInjectable) {
  return new Injectable<T>(params)
}
