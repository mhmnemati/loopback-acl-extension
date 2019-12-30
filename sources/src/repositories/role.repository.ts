import { inject, Getter } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { RoleRepository as RoleModelRepository } from "loopback-authorization-extension";

import { bindACL, ACLBindings, PrivateACLBindings } from "../keys";

import {
    Role,
    RoleRelations,
    UserRole,
    UserRoleRelations,
    RolePermission,
    RolePermissionRelations
} from "../models";

import { UserRoleRepository, RolePermissionRepository } from "./";

@bindACL("RoleRepository")
export class RoleRepository<
    Model extends Role,
    ModelRelations extends RoleRelations
> extends RoleModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.ROLE_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource,
        @inject.getter(ACLBindings.USER_ROLE_REPOSITORY)
        getUserRoleRepository: Getter<
            UserRoleRepository<UserRole, UserRoleRelations>
        >,
        @inject.getter(ACLBindings.ROLE_PERMISSION_REPOSITORY)
        getRolePermissionRepository: Getter<
            RolePermissionRepository<RolePermission, RolePermissionRelations>
        >
    ) {
        super(
            ctor,
            dataSource,
            getUserRoleRepository,
            getRolePermissionRepository
        );
    }
}
