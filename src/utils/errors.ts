export const NO_USE_DEPS = "You can't use property deps";

// Create Container
export const ALREADY_REGISTER = (type: string) => `${type} is already registered`;
export const NOT_REGISTER = (type: string) => `${type} is not register`;

// Create Injectable
export const CIRCULAR_DEPENDENCIES = (type: string) => `${type} has circular dependencies`;
export const DEP_EMPTY = (type: string) => `${type} is empty`;
export const SYMBOL_REQUIRED = 'CreateInjectable needs a symbol';
export const GET_DEP_FUNCTION = 'CreateInjectable needs getDependencie to be a function';
