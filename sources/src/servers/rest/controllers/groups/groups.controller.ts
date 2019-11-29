import { DMSControllerMixin } from "@dms/servers/rest/crud.mixin";
import { Group } from "@dms/models";

export class GroupsController extends DMSControllerMixin<Group>(
    Group,
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
