import {
    inject,
    lifeCycleObserver,
    CoreBindings,
    Application
} from "@loopback/core";
import { Ctor } from "loopback-history-extension";

/** Swagger binding imports */
import {
    RestServer,
    RestComponent,
    RestBindings,
    RestServerConfig
} from "@loopback/rest";
import { RestExplorerComponent } from "@loopback/rest-explorer";

/** Authentication binding imports */
import { AuthenticationComponent } from "@loopback/authentication";

import { Sequence } from "~/servers";

import { PrivateACLBindings } from "~/keys";
import { User, Group, Role, Permission, Session, Code } from "~/models";

import {
    GenerateUsersController,
    GenerateUsersSelfController,
    GenerateUsersSessionController,
    GenerateUsersAccountController,
    GenerateUsersPasswordController,
    GenerateGroupsController,
    GenerateGroupsUsersController,
    GenerateRolesController,
    GenerateRolesUsersController,
    GenerateRolesGroupsController,
    GenerateRolesPermissionsController,
    GeneratePermissionsController
} from "~/servers/rest/controllers";

@lifeCycleObserver("servers.REST")
export class ACLRestServer extends RestServer {
    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        app: Application,
        @inject(RestBindings.CONFIG)
        config: RestServerConfig = {},
        @inject(PrivateACLBindings.USER_MODEL)
        userCtor: Ctor<User>,
        @inject(PrivateACLBindings.GROUP_MODEL)
        groupCtor: Ctor<Group>,
        @inject(PrivateACLBindings.ROLE_MODEL)
        roleCtor: Ctor<Role>,
        @inject(PrivateACLBindings.PERMISSION_MODEL)
        permissionCtor: Ctor<Permission>,
        @inject(PrivateACLBindings.SESSION_MODEL)
        sessionCtor: Ctor<Session>,
        @inject(PrivateACLBindings.CODE_MODEL)
        codeCtor: Ctor<Code>
    ) {
        super(app, config);

        /** Fix rest application to rest server bug */
        (this as any).restServer = this;

        /** Bind authentication component */
        app.component(AuthenticationComponent);

        /** Bind swagger component */
        app.component(RestComponent);
        app.bind("RestExplorerComponent.KEY").to(
            new RestExplorerComponent(this as any, {
                path: "/explorer"
            })
        );

        /** Set up the custom sequence */
        this.sequence(Sequence);

        /** Bind users controllers */
        this.controller(GenerateUsersController<User>(userCtor));
        this.controller(GenerateUsersSelfController<User>(userCtor));
        this.controller(
            GenerateUsersSessionController<Session, User>(sessionCtor, userCtor)
        );
        this.controller(
            GenerateUsersAccountController<Code, User>(codeCtor, userCtor)
        );
        this.controller(
            GenerateUsersPasswordController<Code, User>(codeCtor, userCtor)
        );

        /** Bind groups controllers */
        this.controller(GenerateGroupsController<Group>(groupCtor));
        this.controller(GenerateGroupsUsersController<User>(userCtor));

        /** Bind roles controllers */
        this.controller(GenerateRolesController<Role>(roleCtor));
        this.controller(GenerateRolesUsersController<User>(userCtor));
        this.controller(GenerateRolesGroupsController<Group>(groupCtor));
        this.controller(
            GenerateRolesPermissionsController<Permission>(permissionCtor)
        );

        /** Bind permissions controllers */
        this.controller(
            GeneratePermissionsController<Permission>(permissionCtor)
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
