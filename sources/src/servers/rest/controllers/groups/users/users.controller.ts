import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { UserGroup } from "loopback-authorization-extension";

import { ACLController, ACLRelationControllerMixin } from "~/servers";
import { User } from "~/models";

export function GenerateGroupsUsersController<MemberModel extends User>(
    memberCtor: Ctor<MemberModel>
): Class<ACLController> {
    class GroupsUsersController extends ACLRelationControllerMixin<
        UserGroup,
        User
    >(
        UserGroup,
        memberCtor,
        "/groups/{id}/users",
        controller => controller.userGroupRepository,
        (id, memberId) => new UserGroup({ groupId: id, userId: memberId }),
        (id, memberId) => ({ groupId: id, userId: memberId }),
        {
            read: "GROUPS_READ",
            add: "GROUPS_ADD_USER",
            remove: "GROUPS_REMOVE_USER"
        },
        (context, filter) => ({
            ...filter,
            where: {
                and: [{ groupId: context.args[0] }, filter.where || {}]
            }
        })
    ) {}

    return GroupsUsersController;
}
