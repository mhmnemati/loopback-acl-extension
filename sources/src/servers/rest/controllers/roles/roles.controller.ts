import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLControllerMixin } from "~/servers";
import { Role } from "~/models";

export function GenerateRolesController<Model extends Role>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class RolesController extends ACLControllerMixin<Role>(
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
