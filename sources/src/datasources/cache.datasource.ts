import { juggler } from "@loopback/repository";
import { Options, ModelBuilder } from "loopback-datasource-juggler";

import { bindACL } from "~/keys";

@bindACL("CacheDataSource")
export class CacheDataSource extends juggler.DataSource {
    constructor(settings?: Options, modelBuilder?: ModelBuilder) {
        super(settings, modelBuilder);
    }
}
