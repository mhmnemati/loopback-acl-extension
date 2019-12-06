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
        "/roles/{id}/groups",
        controller => controller.groupRoleRepository,
        (id, memberId) => new GroupRole({ roleId: id, groupId: memberId }),
        (id, memberId) => ({ roleId: id, groupId: memberId }),
        {
            read: "ROLES_READ",
            add: "ROLES_ADD_GROUP",
            remove: "ROLES_REMOVE_GROUP"
        },
        (context, filter) => ({
            ...filter,
            where: {
                and: [{ roleId: context.args[0] }, filter.where || {}]
            }
        })
    ) {}

    return RolesGroupsController;
}
