import { inject, Getter } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { PermissionRepository as PermissionModelRepository } from "loopback-authorization-extension";

import { bindACL, ACLBindings, PrivateACLBindings } from "../keys";

import {
    Permission,
    PermissionRelations,
    RolePermission,
    RolePermissionRelations
} from "../models";

import { RolePermissionRepository } from "./";

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
        @inject.getter(ACLBindings.ROLE_PERMISSION_REPOSITORY)
        getRolePermissionRepository: Getter<
            RolePermissionRepository<RolePermission, RolePermissionRelations>
        >
    ) {
        super(ctor, dataSource, getRolePermissionRepository);
    }
}
