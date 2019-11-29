import { inject } from "@loopback/core";

import {
    bindPermissionRepository,
    PermissionRepository as PermissionModelRepository
} from "loopback-authorization-extension";

import { Permission, PermissionRelations } from "@acl/models";

@bindPermissionRepository()
export class PermissionRepository extends PermissionModelRepository<
    Permission,
    PermissionRelations
> {
    constructor(@inject("datasources.MySQL") dataSource: MySQLDataSource) {
        super(Permission, dataSource);
    }
}
