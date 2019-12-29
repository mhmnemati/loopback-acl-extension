import { inject, Getter } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { UserRoleRepository as UserRoleModelRepository } from "loopback-authorization-extension";

import { bindACL, PrivateACLBindings, ACLBindings } from "../keys";

import {
    UserRole,
    UserRoleRelations,
    User,
    UserRelations,
    Role,
    RoleRelations
} from "../models";

import { UserRepository, RoleRepository } from "./";

@bindACL("UserRoleRepository")
export class UserRoleRepository<
    Model extends UserRole,
    ModelRelations extends UserRoleRelations
> extends UserRoleModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.USER_ROLE_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource,
        @inject.getter(ACLBindings.USER_REPOSITORY)
        getUserRepository: Getter<UserRepository<User, UserRelations>>,
        @inject.getter(ACLBindings.ROLE_REPOSITORY)
        getRoleRepository: Getter<RoleRepository<Role, RoleRelations>>
    ) {
        super(
            ctor,
            dataSource,
            getUserRepository as any,
            getRoleRepository as any
        );
    }
}
