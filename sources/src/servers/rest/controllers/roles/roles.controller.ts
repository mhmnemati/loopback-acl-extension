import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLControllerMixin } from "../../../../servers";
import { Role } from "../../../../models";

export function GenerateRolesController<Model extends Role>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class RolesController extends ACLControllerMixin<ACLController, Role>(
        ACLController,
        ctor,
        "id",
        "/roles",
        controller => controller.roleRepository
    ) {}

    return RolesController;
}
