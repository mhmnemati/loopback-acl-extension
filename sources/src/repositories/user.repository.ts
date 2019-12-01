import { juggler } from "@loopback/repository";
import { UserRepository as UserModelRepository } from "loopback-authorization-extension";

import { User, UserRelations } from "@acl/models";
import {
    bindUserRepository,
    injectUserModel,
    injectRDBMSDataSource
} from "@acl/keys";

@bindUserRepository()
export class UserRepository extends UserModelRepository<User, UserRelations> {
    constructor(
        @injectUserModel()
        ctor: typeof User & { prototype: User },
        @injectRDBMSDataSource()
        dataSource: juggler.DataSource[]
    ) {
        super(ctor, dataSource[0]);
    }
}
