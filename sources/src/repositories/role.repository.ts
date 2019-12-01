import { juggler } from "@loopback/repository";
import { RoleRepository as RoleModelRepository } from "loopback-authorization-extension";

import { Role, RoleRelations } from "@acl/models";
import {
    bindRoleRepository,
    injectRoleModel,
    injectRDBMSDataSource
} from "@acl/keys";

@bindRoleRepository()
export class RoleRepository extends RoleModelRepository<Role, RoleRelations> {
    constructor(
        @injectRoleModel()
        ctor: typeof Role & { prototype: Role },
        @injectRDBMSDataSource()
        dataSource: juggler.DataSource[]
    ) {
        super(ctor, dataSource[0]);
    }
}
