import { juggler } from "@loopback/repository";
import { inject } from "@loopback/context";
import { Options, ModelBuilder } from "loopback-datasource-juggler";

import { bindACL } from "~/keys";

@bindACL("CacheDataSource")
export class CacheDataSource extends juggler.DataSource {
    constructor(
        @inject("private.acl.dataSources.cache.settings", {
            optional: true
        })
        settings?: Options,
        @inject("private.acl.dataSources.cache.modelBuilder", {
            optional: true
        })
        modelBuilder?: ModelBuilder
    ) {
        super(settings, modelBuilder);
    }
}
