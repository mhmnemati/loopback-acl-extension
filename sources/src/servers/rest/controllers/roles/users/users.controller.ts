import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { UserRole } from "loopback-authorization-extension";

import { ACLController, ACLRelationControllerMixin } from "~/servers";
import { User } from "~/models";

export function GenerateRolesUsersController<MemberModel extends User>(
    memberCtor: Ctor<MemberModel>
): Class<ACLController> {
    class RolesUsersController extends ACLRelationControllerMixin<
        UserRole,
        User
    >(
        UserRole,
        memberCtor,
        "/roles/{id}/users",
        controller => controller.userRoleRepository,
        (id, memberId) => new UserRole({ roleId: id, userId: memberId }),
        (id, memberId) => ({ roleId: id, userId: memberId }),
        {
            read: "ROLES_READ",
            add: "ROLES_ADD_USER",
            remove: "ROLES_REMOVE_USER"
        },
        (context, filter) => ({
            ...filter,
            where: {
                and: [{ roleId: context.args[0] }, filter.where || {}]
            }
        })
    ) {}

    return RolesUsersController;
}
