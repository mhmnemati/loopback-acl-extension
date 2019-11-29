import { inject } from "@loopback/core";

import {
    bindGroupRepository,
    GroupRepository as GroupModelRepository
} from "loopback-authorization-extension";

import { Group, GroupRelations } from "@acl/models";

@bindGroupRepository()
export class GroupRepository extends GroupModelRepository<
    Group,
    GroupRelations
> {
    constructor(@inject("datasources.MySQL") dataSource: MySQLDataSource) {
        super(Group, dataSource);
    }
}
