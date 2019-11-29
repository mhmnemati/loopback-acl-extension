import { inject } from "@loopback/core";

import {
    bindUserRepository,
    UserRepository as UserModelRepository
} from "loopback-authorization-extension";

import { User, UserRelations } from "@acl/models";

@bindUserRepository()
export class UserRepository extends UserModelRepository<User, UserRelations> {
    constructor(@inject("datasources.MySQL") dataSource: MySQLDataSource) {
        super(User, dataSource);
    }
}
