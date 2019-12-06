import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "~/servers";
import { Role } from "~/models";

export function GenerateRolesController<Model extends Role>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class RolesController extends ACLCRUDControllerMixin<Role>(
        ctor,
        "/roles",
        controller => controller.roleRepository,
        {
            create: "ROLES_WRITE",
            read: "ROLES_READ",
            update: "ROLES_WRITE",
            delete: "ROLES_WRITE"
        },
        (context, filter) => filter
    ) {}

    return RolesController;
}
