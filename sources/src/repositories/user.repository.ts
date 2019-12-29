import { inject, Getter } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { UserRepository as UserModelRepository } from "loopback-authorization-extension";

import { bindACL, PrivateACLBindings, ACLBindings } from "../keys";

import { User, UserRelations, UserRole, UserRoleRelations } from "../models";

import { UserRoleRepository } from "./";

@bindACL("UserRepository")
export class UserRepository<
    Model extends User,
    ModelRelations extends UserRelations
> extends UserModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.USER_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource,
        @inject.getter(ACLBindings.USER_ROLE_REPOSITORY)
        getUserRoleRepository: Getter<
            UserRoleRepository<UserRole, UserRoleRelations>
        >
    ) {
        super(ctor, dataSource, getUserRoleRepository);
    }
}
