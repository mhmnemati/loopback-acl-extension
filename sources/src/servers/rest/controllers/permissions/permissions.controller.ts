import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLControllerMixin } from "../../../../servers";
import { Permission } from "../../../../models";

export function GeneratePermissionsController<Model extends Permission>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class PermissionsController extends ACLControllerMixin<
        ACLController,
        Permission
    >(
        ACLController,
        ctor,
        "id",
        "/permissions",
        controller => controller.permissionRepository
    ) {}

    return PermissionsController;
}
