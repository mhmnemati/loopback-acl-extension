import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { UserRole } from "loopback-authorization-extension";

import {
    ACLController,
    ACLRelationControllerMixin
} from "../../../../../servers";
import { User } from "../../../../../models";

export function GenerateRolesUsersController<MemberModel extends User>(
    memberCtor: Ctor<MemberModel>
): Class<ACLController> {
    class RolesUsersController extends ACLRelationControllerMixin<
        UserRole,
        User
    >(
        UserRole,
        memberCtor,
        "roleId",
        "id",
        "/roles/{id}/users",
        controller => controller.userRoleRepository,
        (id, memberId) => new UserRole({ roleId: id, userId: memberId }),
        (id, memberId) => ({ roleId: id, userId: memberId }),
        {
            read: {
                permission: "ROLES_READ",
                filter: (context, filter) => filter
            },
            add: {
                permission: "ROLES_ADD_USER"
            },
            remove: {
                permission: "ROLES_REMOVE_USER"
            },
            history: {
                permission: "ROLES_HISTORY",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return RolesUsersController;
}
