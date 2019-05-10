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
import { DepInjection, inject } from "depsin";

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

class App {
  static deps = [TYPES.Auth, TYPES.Login];
  constructor(private auth: Auth, private service: LoginService) {}

  makeLogin() {
    return this.service.login();
  }

  token() {
    return this.auth.getToken();
  }
}

const container = new DepInjection({ [TYPES.App]: App }, { [TYPES.Url]: url })
  // .set(TYPES.Url, url)
  .register(TYPES.Auth, Auth)
  .register(TYPES.Login, LoginService);

const app = container.get<App>(TYPES.App);
console.log(app.token()); // undefined
console.log(app.makeLogin()); // http://myurl.web && You are logged
console.log(app.token()); // I'm a token
```

### JavaScript
```
const { DepInjection } = require("depsin");

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

LoginService.deps = [TYPES.Auth];

class App {
  constructor(auth, service) {
    this.auth = auth;
    this.service = service;
  }

  makeLogin() {
    return this.service.login();
  }

  token() {
    return this.auth.getToken();
  }
}

App.deps = [TYPES.Auth, TYPES.Login];

const container = new DepInjection({[TYPES.Auth]: Auth})
  .register(TYPES.App, App)
  .register(TYPES.Login, LoginService);

const app = container.get(TYPES.App);
console.log(app.token()); // undefined
console.log(app.makeLogin()); // You are logged
console.log(app.token()); // I'm a token
```

## References
- [Dependency Injection in JavaScript 101](https://dev.to/azure/dependency-injection-in-javascript-101-2b1e)
- [InversifyJS](https://github.com/inversify/InversifyJS/)