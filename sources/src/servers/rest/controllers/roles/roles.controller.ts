import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "../../../../servers";
import { Role } from "../../../../models";

export function GenerateRolesController<Model extends Role>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class RolesController extends ACLCRUDControllerMixin<ACLController, Role>(
        ACLController,
        ctor,
        "id",
        "/roles",
        controller => controller.roleRepository,
        {
            create: {
                permission: "ROLES_WRITE"
            },
            read: {
                permission: "ROLES_READ",
                filter: (context, filter) => filter
            },
            update: {
                permission: "ROLES_WRITE",
                filter: (context, filter) => filter
            },
            delete: {
                permission: "ROLES_WRITE",
                filter: (context, filter) => filter
            },
            history: {
                permission: "ROLES_HISTORY",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return RolesController;
}
