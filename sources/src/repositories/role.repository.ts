import { inject } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { RoleRepository as RoleModelRepository } from "loopback-authorization-extension";

import { PrivateACLBindings } from "@acl/keys";
import { Role, RoleRelations } from "@acl/models";

export class RoleRepository<
    Model extends Role,
    ModelRelations extends RoleRelations
> extends RoleModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.ROLE_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource
    ) {
        super(ctor, dataSource);
    }
}
