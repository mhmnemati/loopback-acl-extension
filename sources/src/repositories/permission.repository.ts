import { inject } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { PermissionRepository as PermissionModelRepository } from "loopback-authorization-extension";

import { PrivateACLBindings } from "~/keys";

import { Permission, PermissionRelations } from "~/models";

export class PermissionRepository<
    Model extends Permission,
    ModelRelations extends PermissionRelations
> extends PermissionModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.PERMISSION_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource
    ) {
        super(ctor, dataSource);
    }
}
