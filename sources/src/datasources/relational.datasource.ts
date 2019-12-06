import { DataSource } from "loopback-authorization-extension";
import { Options, ModelBuilder } from "loopback-datasource-juggler";

import { bindACL } from "~/keys";

@bindACL("RelationalDataSource")
export class RelationalDataSource extends DataSource {
    constructor(settings?: Options, modelBuilder?: ModelBuilder) {
        super(settings, modelBuilder);
    }
}
