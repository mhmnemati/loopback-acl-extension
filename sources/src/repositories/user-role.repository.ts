import { UserRoleRepositoryMixin } from "loopback-authorization-extension";

import { UserRole, UserRoleRelations } from "../models";

export class DefaultUserRoleRepository extends UserRoleRepositoryMixin<
    UserRole,
    UserRoleRelations
>() {}
