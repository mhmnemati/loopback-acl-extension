import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "../../../../servers";
import { Group } from "../../../../models";

export function GenerateGroupsController<Model extends Group>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class GroupsController extends ACLCRUDControllerMixin<Group>(
        ctor,
        "id",
        "/groups",
        controller => controller.groupRepository,
        {
            create: {
                permission: "GROUPS_WRITE"
            },
            read: {
                permission: "GROUPS_READ",
                filter: (context, filter) => filter
            },
            update: {
                permission: "GROUPS_WRITE",
                filter: (context, filter) => filter
            },
            delete: {
                permission: "GROUPS_WRITE",
                filter: (context, filter) => filter
            },
            history: {
                permission: "GROUPS_HISTORY",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return GroupsController;
}
