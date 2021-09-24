import { Token } from './types'

// Create Container
export const ALREADY_REGISTER = (type: Token) => `${String(type)} is already registered`
export const NOT_REGISTER = (type: Token) => `${String(type)} is not register`

// Create Injectable
export const CIRCULAR_DEPENDENCIES = (type: Token) => `${String(type)} has circular dependencies`
export const DEP_EMPTY = (type: Token) => `${String(type)} is empty`
export const SYMBOL_REQUIRED = 'CreateInjectable needs a symbol'
