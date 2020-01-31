import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLPermissions } from "../../../../types";

import { ACLController, ACLControllerMixin } from "../../../../servers";
import { Role } from "../../../../models";

export function GenerateRolesController<Model extends Role>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class RolesController extends ACLControllerMixin<
        Role,
        ACLPermissions,
        ACLController
    >(
        ACLController,
        ctor,
        {
            repositoryGetter: controller => controller.roleRepository,
            read: ["ROLES_READ", async (context, where) => where],
            include: {}
        },
        ""
    ) {}

    return RolesController;
}
