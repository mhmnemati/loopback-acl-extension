import { inject, Getter } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { RolePermissionRepository as RolePermissionModelRepository } from "loopback-authorization-extension";

import { bindACL, PrivateACLBindings, ACLBindings } from "../keys";

import {
    RolePermission,
    RolePermissionRelations,
    Role,
    RoleRelations,
    Permission,
    PermissionRelations
} from "../models";

import { RoleRepository, PermissionRepository } from "./";

@bindACL("RolePermissionRepository")
export class RolePermissionRepository<
    Model extends RolePermission,
    ModelRelations extends RolePermissionRelations
> extends RolePermissionModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.ROLE_PERMISSION_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource,
        @inject.getter(ACLBindings.ROLE_REPOSITORY)
        getRoleRepository: Getter<RoleRepository<Role, RoleRelations>>,
        @inject.getter(ACLBindings.PERMISSION_REPOSITORY)
        getPermissionRepository: Getter<
            PermissionRepository<Permission, PermissionRelations>
        >
    ) {
        super(
            ctor,
            dataSource,
            getRoleRepository as any,
            getPermissionRepository as any
        );
    }
}
