import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { UserGroup } from "loopback-authorization-extension";

import {
    ACLController,
    ACLRelationControllerMixin
} from "../../../../../servers";
import { User } from "../../../../../models";

export function GenerateGroupsUsersController<MemberModel extends User>(
    memberCtor: Ctor<MemberModel>
): Class<ACLController> {
    class GroupsUsersController extends ACLRelationControllerMixin<
        UserGroup,
        User
    >(
        UserGroup,
        memberCtor,
        "groupId",
        "id",
        "/groups/{id}/users",
        controller => controller.userGroupRepository,
        (id, memberId) => new UserGroup({ groupId: id, userId: memberId }),
        (id, memberId) => ({ groupId: id, userId: memberId }),
        {
            read: {
                permission: "GROUPS_READ",
                filter: (context, filter) => filter
            },
            add: {
                permission: "GROUPS_ADD_USER"
            },
            remove: {
                permission: "GROUPS_REMOVE_USER"
            },
            history: {
                permission: "GROUPS_HISTORY",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return GroupsUsersController;
}
