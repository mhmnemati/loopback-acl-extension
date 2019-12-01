import { juggler } from "@loopback/repository";
import { GroupRepository as GroupModelRepository } from "loopback-authorization-extension";

import { Group, GroupRelations } from "@acl/models";
import {
    bindGroupRepository,
    injectGroupModel,
    injectRDBMSDataSource
} from "@acl/keys";

@bindGroupRepository()
export class GroupRepository extends GroupModelRepository<
    Group,
    GroupRelations
> {
    constructor(
        @injectGroupModel()
        ctor: typeof Group & { prototype: Group },
        @injectRDBMSDataSource()
        dataSource: juggler.DataSource[]
    ) {
        super(ctor, dataSource[0]);
    }
}
