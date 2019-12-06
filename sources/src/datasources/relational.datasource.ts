import { DataSource } from "loopback-authorization-extension";
import { inject } from "@loopback/context";
import { Options, ModelBuilder } from "loopback-datasource-juggler";

import { bindACL } from "~/keys";

@bindACL("RelationalDataSource")
export class RelationalDataSource extends DataSource {
    constructor(
        @inject("private.acl.dataSources.relational.settings", {
            optional: true
        })
        settings?: Options,
        @inject("private.acl.dataSources.relational.modelBuilder", {
            optional: true
        })
        modelBuilder?: ModelBuilder
    ) {
        super(settings, modelBuilder);
    }
}
