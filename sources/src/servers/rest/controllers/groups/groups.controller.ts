import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "~/servers";
import { Group } from "~/models";

export function GenerateGroupsController<Model extends Group>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class GroupsController extends ACLCRUDControllerMixin<Group>(
        ctor,
        "/groups",
        controller => controller.groupRepository,
        {
            create: "GROUPS_WRITE",
            read: "GROUPS_READ",
            update: "GROUPS_WRITE",
            delete: "GROUPS_WRITE"
        },
        (context, filter) => filter
    ) {}

    return GroupsController;
}
