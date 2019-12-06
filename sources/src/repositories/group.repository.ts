import { inject } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { GroupRepository as GroupModelRepository } from "loopback-authorization-extension";

import { bindACL, PrivateACLBindings } from "~/keys";

import { Group, GroupRelations } from "~/models";

@bindACL("GroupRepository")
export class GroupRepository<
    Model extends Group,
    ModelRelations extends GroupRelations
> extends GroupModelRepository<Model, ModelRelations> {
    constructor(
        @inject(PrivateACLBindings.GROUP_MODEL)
        ctor: Ctor<Model>,
        @inject(PrivateACLBindings.RELATIONAL_DATASOURCE)
        dataSource: juggler.DataSource
    ) {
        super(ctor, dataSource);
    }
}
