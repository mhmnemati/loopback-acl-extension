import { inject } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { UserRepository as UserModelRepository } from "loopback-authorization-extension";

import { bindACL, PrivateACLBindings } from "../keys";

import { User, UserRelations } from "../models";

@bindACL("UserRepository")
export class UserRepository<
    Model extends User,
    ModelRelations extends UserRelations
> extends UserModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.USER_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource
    ) {
        super(ctor, dataSource);
    }
}
