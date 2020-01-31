import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLPermissions } from "../../../../types";

import { ACLController, ACLControllerMixin } from "../../../../servers";
import { Permission } from "../../../../models";

export function GeneratePermissionsController<Model extends Permission>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class PermissionsController extends ACLControllerMixin<
        Permission,
        ACLPermissions,
        ACLController
    >(
        ACLController,
        ctor,
        {
            repositoryGetter: controller => controller.permissionRepository,
            read: ["PERMISSIONS_READ", async (context, where) => where],
            include: {}
        },
        ""
    ) {}

    return PermissionsController;
}
