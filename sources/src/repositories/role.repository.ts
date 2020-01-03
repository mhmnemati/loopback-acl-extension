import { RoleRepositoryMixin } from "loopback-authorization-extension";

import { Role, RoleRelations } from "../models";

export class DefaultRoleRepository extends RoleRepositoryMixin<
    Role,
    RoleRelations
>() {}
