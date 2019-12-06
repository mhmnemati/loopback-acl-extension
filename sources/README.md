# loopback-acl-extension

Creating `User`, `Group`, `Role`, `Permission` models and repositories and crud controllers in any application is a repetitive and futile task.

Using this extension your can bind them to your application using a simple and optional configurations.

## Installation

```bash
npm i --save loopback-acl-extension
npm i --save loopback-authorization-extension
```

## Usage

Follow these steps to add `acl` extension to your loopback4 application

1. Define your Relational and Cache `dataSources`
2. Add `ACLMixin` to your application
3. Bind `ACLRestServer`

Now, let's try:

---

### Step 1 (Define DataSource)

Bind your dataSources you want to use for acl tables using extending to `RelationalDataSource` or `CacheDataSource`

We need two dataSource, one for relational models, and one for cache models

1. **Relational Models**: `CRUD`
    1. `User`
    2. `Group`
    3. `Role`
    4. `Permission`
2. **Cache Models**: `Key-Value`
    1. `Session`
    2. `Code`

See this example of binding relational dataSource:

```ts
import { bindACL } from "loopback-acl-extension";
import { bindAuthorization } from "loopback-authorization-extension";

@bindACL("RelationalDataSource")
@bindAuthorization("DataSource")
export class MySqlDataSource extends juggler.DataSource {
    static dataSourceName = "MySQL";

    constructor(
        @inject("datasources.config.MySQL", { optional: true })
        dsConfig: object = config
    ) {
        super(dsConfig);
    }
}
```

See this example of binding cache dataSource:

```ts
import { bindACL } from "loopback-acl-extension";

@bindACL("CacheDataSource")
export class RedisDataSource extends juggler.DataSource {
    static dataSourceName = "Redis";

    constructor(
        @inject("datasources.config.Redis", { optional: true })
        dsConfig: object = config
    ) {
        super(dsConfig);
    }
}
```

---

### Step 2,3 (Application Mixin)

Edit your `application.ts` file:

```ts
import { AuthorizationMixin } from "loopback-authorization-extension";
import { ACLMixin, ACLRestServer, ACLGQLServer } from "loopback-acl-extension";

export class TestApplication extends AuthorizationMixin(
    ACLMixin(BootMixin(ServiceMixin(RepositoryMixin(Application))))
) {
    constructor(options: ApplicationConfig = {}) {
        super(options);

        // ...

        // Bind servers
        this.server(ACLRestServer);
        this.server(ACLGQLServer);
    }
}
```

---

## Contributions

-   [KoLiBer](https://www.linkedin.com/in/mohammad-hosein-nemati-665b1813b/)

## License

This project is licensed under the [MIT license](LICENSE).  
Copyright (c) KoLiBer (koliberr136a1@gmail.com)
