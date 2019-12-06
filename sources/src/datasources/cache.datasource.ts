import { juggler } from "@loopback/repository";

import { bindACL } from "~/keys";

@bindACL("CacheDataSource")
export class CacheDataSource extends juggler.DataSource {}
