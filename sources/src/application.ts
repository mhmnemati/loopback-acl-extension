import { BootMixin } from "@loopback/boot";
import { ServiceMixin } from "@loopback/service-proxy";
import { RepositoryMixin } from "@loopback/repository";
import {
    Application as LBApplication,
    ApplicationConfig,
    CoreBindings
} from "@loopback/core";
import { AuthorizationMixin } from "loopback-authorization-extension";

import { Permissions } from "@acl/permissions";

import { RestServer } from "@acl/servers/rest/server";
import { GQLServer } from "@acl/servers/graphql/server";

export class Application extends AuthorizationMixin(
    BootMixin(ServiceMixin(RepositoryMixin(LBApplication))),
    {
        permissions: Permissions
    }
) {
    constructor(options: ApplicationConfig = {}) {
        super(options);

        // Customize @loopback/boot Booter Conventions here
        this.projectRoot = __dirname;
        this.bootOptions = {
            controllers: {
                // Customize ControllerBooter Conventions here
                dirs: ["servers"],
                extensions: [".controller.js"],
                nested: true
            }
        };

        // Fix: servers start dependency bug
        this.bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to({
            orderedGroups: ["server-rest", "server-graphql"]
        });

        // Servers binding
        this.server(DMSRestServer);
        this.server(DMSGQLServer);
    }
}
