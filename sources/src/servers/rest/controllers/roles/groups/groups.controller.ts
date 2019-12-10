import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { GroupRole } from "loopback-authorization-extension";

import { ACLController, ACLRelationControllerMixin } from "~/servers";
import { Group } from "~/models";

export function GenerateRolesGroupsController<MemberModel extends Group>(
    memberCtor: Ctor<MemberModel>
): Class<ACLController> {
    class RolesGroupsController extends ACLRelationControllerMixin<
        GroupRole,
        Group
    >(
        GroupRole,
        memberCtor,
        "roleId",
        "id",
        "/roles/{id}/groups",
        controller => controller.groupRoleRepository,
        (id, memberId) => new GroupRole({ roleId: id, groupId: memberId }),
        (id, memberId) => ({ roleId: id, groupId: memberId }),
        {
            read: {
                permission: "ROLES_READ",
                filter: (context, filter) => filter
            },
            add: {
                permission: "ROLES_ADD_GROUP"
            },
            remove: {
                permission: "ROLES_REMOVE_GROUP"
            },
            history: {
                permission: "ROLES_HISTORY",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return RolesGroupsController;
}
