import { DataSource } from "loopback-authorization-extension";

import { bindACL } from "~/keys";

@bindACL("RelationalDataSource")
export class RelationalDataSource extends DataSource {}
