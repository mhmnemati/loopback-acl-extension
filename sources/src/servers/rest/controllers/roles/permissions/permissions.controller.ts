import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { RolePermission } from "loopback-authorization-extension";

import {
    ACLController,
    ACLRelationControllerMixin
} from "../../../../../servers";
import { Permission } from "../../../../../models";

export function GenerateRolesPermissionsController<
    MemberModel extends Permission
>(memberCtor: Ctor<MemberModel>): Class<ACLController> {
    class RolesPermissionsController extends ACLRelationControllerMixin<
        RolePermission,
        Permission
    >(
        RolePermission,
        memberCtor,
        "roleId",
        "id",
        "/roles/{id}/permissions",
        controller => controller.rolePermissionRepository,
        (id, memberId) =>
            new RolePermission({ roleId: id, permissionId: memberId }),
        (id, memberId) => ({ roleId: id, permissionId: memberId }),
        {
            read: {
                permission: "ROLES_READ",
                filter: (context, filter) => filter
            },
            add: {
                permission: "ROLES_ADD_PERMISSION"
            },
            remove: {
                permission: "ROLES_REMOVE_PERMISSION"
            },
            history: {
                permission: "ROLES_HISTORY",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return RolesPermissionsController;
}
