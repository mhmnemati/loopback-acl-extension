import { inject, lifeCycleObserver, CoreBindings } from "@loopback/core";

import { Application } from "@acl/application";
import { Sequence } from "@acl/servers/rest/sequence";
import * as path from "path";

/** Swagger binding imports */
import {
    RestServer,
    RestComponent,
    RestBindings,
    RestServerConfig
} from "@loopback/rest";
import { RestExplorerComponent } from "@loopback/rest-explorer";

/** Authentication binding imports */
import {
    AuthenticationComponent,
    registerAuthenticationStrategy
} from "@loopback/authentication";
import {
    BearerTokenService,
    BearerAuthenticationStrategy
} from "@acl/providers";
import { ACLBindings } from "@acl/keys";

/** Authorization binding imports */
import { AuthorizationComponent } from "loopback-authorization-extension";

@lifeCycleObserver("server-rest")
export class ACLRestServer extends RestServer {
    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        app: Application,
        @inject(RestBindings.CONFIG)
        config: RestServerConfig = {}
    ) {
        super(app, config);

        // Set up the custom sequence
        this.sequence(Sequence);

        // Set up default home page
        this.static("/", path.join(__dirname, "../../../public"));

        // fix rest application to rest server bug
        (this as any).restServer = this;

        this.bindAuthentication(app);
        this.bindAuthorization(app);
        this.bindSwagger(app);
    }

    private bindAuthentication(app: Application) {
        app.bind(ACLBindings.TOKEN_SERVICE).toClass(BearerTokenService);
        registerAuthenticationStrategy(app, BearerAuthenticationStrategy);
        app.component(AuthenticationComponent);
    }

    private bindAuthorization(app: Application) {
        app.component(AuthorizationComponent);
    }

    private bindSwagger(app: Application) {
        app.component(RestComponent);
        app.bind("RestExplorerComponent.KEY").to(
            new RestExplorerComponent(this as any, {
                path: "/explorer"
            })
        );
    }

    async start() {
        await super.start();

        console.log(`REST Server is running on url ${this.url}`);
    }
    async stop() {
        await super.stop();

        console.log(`REST Server is stopped!`);
    }
}
