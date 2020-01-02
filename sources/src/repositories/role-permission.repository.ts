import { RolePermissionRepositoryMixin } from "loopback-authorization-extension";

import { RolePermission, RolePermissionRelations } from "../models";

export class DefaultRolePermissionRepository extends RolePermissionRepositoryMixin<
    RolePermission,
    RolePermissionRelations
>() {}
