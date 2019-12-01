import { juggler } from "@loopback/repository";
import { PermissionRepository as PermissionModelRepository } from "loopback-authorization-extension";

import { Permission, PermissionRelations } from "@acl/models";
import {
    bindPermissionRepository,
    injectPermissionModel,
    injectRDBMSDataSource
} from "@acl/keys";

@bindPermissionRepository()
export class PermissionRepository extends PermissionModelRepository<
    Permission,
    PermissionRelations
> {
    constructor(
        @injectPermissionModel()
        ctor: typeof Permission & { prototype: Permission },
        @injectRDBMSDataSource()
        dataSource: juggler.DataSource[]
    ) {
        super(ctor, dataSource[0]);
    }
}
