import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { RolePermission } from "loopback-authorization-extension";

import { ACLController, ACLRelationControllerMixin } from "~/servers";
import { Permission } from "~/models";

export function GenerateRolesPermissionsController<
    MemberModel extends Permission
>(memberCtor: Ctor<MemberModel>): Class<ACLController> {
    class RolesPermissionsController extends ACLRelationControllerMixin<
        RolePermission,
        Permission
    >(
        RolePermission,
        memberCtor,
        "/roles/{id}/permissions",
        controller => controller.rolePermissionRepository,
        (id, memberId) =>
            new RolePermission({ roleId: id, permissionId: memberId }),
        (id, memberId) => ({ roleId: id, permissionId: memberId }),
        {
            read: "ROLES_READ",
            add: "ROLES_ADD_PERMISSION",
            remove: "ROLES_REMOVE_PERMISSION"
        },
        (context, filter) => ({
            ...filter,
            where: {
                and: [{ roleId: context.args[0] }, filter.where || {}]
            }
        })
    ) {}

    return RolesPermissionsController;
}
