# Depsin

[![npm version](https://badgen.net/npm/v/depsin)](https://www.npmjs.com/package/depsin)
![downloads](https://badgen.net/npm/dt/depsin)
![download size](https://badgen.net/bundlephobia/min/depsin)

## About
Depsin is a lightweight dependency injector for JavaScript/Typescript.

## Installation
You can install depsin using npm or yarn:
```
$ npm install depsin
$ yarn add depsin
```

If you use Typescript and want to use the decorator `@inject` you muste add in your `tsconfig.json`
```
{
  "compilerOptions": {
    ...
    "experimentalDecorators": true,
    ...
  }
}
```

## Examples

### Typescript
```
import { createContainer, DEPS_SYMBOL, inject } from "depsin";

enum TYPES {
  Auth = "auth",
  Login = "login",
  App = "app",
  Url = "url"
}

const url = "http://myurl.web";

class Auth {
  private token: string;

  constructor(@inject(TYPES.Url) private url: string) {}

  login() {
    console.log(this.url);
    this.token = "I'm a token";
  }

  getToken() {
    return this.token;
  }
}

class LoginService {
  constructor(@inject(TYPES.Auth) private auth: Auth) {}

  login() {
    this.auth.login();
    return "You are logged";
  }
}

function App(auth, service) {
  return {
    makeLogin() {
      return service.login();
    },
    token() {
      return auth.getToken();
    }
  }
}
App[DEPS_SYMBOL] = [TYPES.Auth, TYPES.Login];

const container = createContainer({
  [TYPES.Login]: { asClass: LoginService },
  [TYPES.Url]: { asValue: url }
})
container.register(TYPES.App).asFunction(App);
container.register(TYPES.Auth).asClass(Auth).toSingleton();

const app = container.get<ReturnType<typeof App>>(TYPES.App);
console.log(app.token()); // undefined
console.log(app.makeLogin()); // http://myurl.web && You are logged
console.log(app.token()); // I'm a token
```

### JavaScript
```
const { createContainer, DEPS_SYMBOL } = require("depsin");

const TYPES = {
  Auth: "auth",
  Login: "login",
  App: "app"
};

class Auth {
  login() {
    this.token = "I'm a token";
  }

  getToken() {
    return this.token;
  }
}

class LoginService {
  constructor(auth) {
    this.auth = auth;
  }

  login() {
    this.auth.login();
    return "You are logged";
  }
}

LoginService[DEPS_SYMBOL] = [TYPES.Auth];

function App(auth, service) {
  return {
    makeLogin() {
      return service.login();
    },
    token() {
      return auth.getToken();
    }
  }
}
App[DEPS_SYMBOL] = [TYPES.Auth, TYPES.Login];

const container = createContainer({
  [TYPES.Login]: { asClass: LoginService }
})
container.register(TYPES.App).asFunction(App);
container.register(TYPES.Auth).asClass(Auth).toSingleton();

const app = container.get(TYPES.App);
console.log(app.token()); // undefined
console.log(app.makeLogin()); // You are logged
console.log(app.token()); // I'm a token
```

## References
- [Dependency Injection in JavaScript 101](https://dev.to/azure/dependency-injection-in-javascript-101-2b1e)
- [InversifyJS](https://github.com/inversify/InversifyJS)
- [Awilix](https://github.com/jeffijoe/awilix)