import {
    inject,
    lifeCycleObserver,
    CoreBindings,
    Application
} from "@loopback/core";
import { Ctor } from "loopback-history-extension";

import * as path from "path";

/** Swagger binding imports */
import { RestServer, RestComponent } from "@loopback/rest";
import { RestExplorerComponent } from "@loopback/rest-explorer";

/** Authentication binding imports */
import { AuthenticationComponent } from "@loopback/authentication";

import { PrivateACLBindings, ACLBindings } from "@acl/keys";
import { ACLApplicationConfig } from "@acl/types";

import { User, Group, Role, Permission, Session, Code } from "@acl/models";

import { Sequence } from "@acl/servers/rest/sequence";

import { GenerateUsersController } from "@acl/servers/rest/controllers";

@lifeCycleObserver("servers.REST")
export class ACLRestServer extends RestServer {
    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        app: Application,
        @inject(ACLBindings.APPLICATION_CONFIG)
        config: ACLApplicationConfig = {},
        @inject(PrivateACLBindings.USER_MODEL)
        userModel: Ctor<User>,
        @inject(PrivateACLBindings.GROUP_MODEL)
        groupModel: Ctor<Group>,
        @inject(PrivateACLBindings.ROLE_MODEL)
        roleModel: Ctor<Role>,
        @inject(PrivateACLBindings.PERMISSION_MODEL)
        permissionModel: Ctor<Permission>,
        @inject(PrivateACLBindings.SESSION_MODEL)
        sessionModel: Ctor<Session>,
        @inject(PrivateACLBindings.CODE_MODEL)
        codeModel: Ctor<Code>
    ) {
        super(app, config.rest);

        /**
         * Set up the custom sequence
         */
        this.sequence(Sequence);

        /**
         * Set up default home page
         */
        this.static("/", path.join(__dirname, "../../../public"));

        /**
         * Fix rest application to rest server bug
         */
        (this as any).restServer = this;

        /**
         * Set up authentication
         */
        app.component(AuthenticationComponent);

        /**
         * Set up swagger
         */
        app.component(RestComponent);
        app.bind("RestExplorerComponent.KEY").to(
            new RestExplorerComponent(this as any, {
                path: "/explorer"
            })
        );

        /**
         * Bind controllers
         */
        this.controller(GenerateUsersController(userModel));
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
