import { inject } from "@loopback/core";

import {
    bindRoleRepository,
    RoleRepository as RoleModelRepository
} from "loopback-authorization-extension";

import { Role, RoleRelations } from "@acl/models";

@bindRoleRepository()
export class RoleRepository extends RoleModelRepository<Role, RoleRelations> {
    constructor(@inject("datasources.MySQL") dataSource: MySQLDataSource) {
        super(Role, dataSource);
    }
}
