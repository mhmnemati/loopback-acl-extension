import { inject, Getter } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import {
    PermissionRepository as PermissionModelRepository,
    AuthorizationBindings,
    RolePermissionRepository
} from "loopback-authorization-extension";

import { bindACL, PrivateACLBindings } from "../keys";

import {
    Permission,
    PermissionRelations,
    RolePermission,
    RolePermissionRelations
} from "../models";

@bindACL("PermissionRepository")
export class PermissionRepository<
    Model extends Permission,
    ModelRelations extends PermissionRelations
> extends PermissionModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.PERMISSION_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource,
        @inject.getter(AuthorizationBindings.ROLE_PERMISSION_REPOSITORY)
        getRolePermissionRepository: Getter<
            RolePermissionRepository<RolePermission, RolePermissionRelations>
        >
    ) {
        super(ctor, dataSource, getRolePermissionRepository);
    }
}
