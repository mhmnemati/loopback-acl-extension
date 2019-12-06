import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "~/servers";
import { Permission } from "~/models";

export function GeneratePermissionsController<Model extends Permission>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class PermissionsController extends ACLCRUDControllerMixin<Permission>(
        ctor,
        "/permissions",
        controller => controller.permissionRepository,
        {
            create: "PERMISSIONS_WRITE",
            read: "PERMISSIONS_READ",
            update: "PERMISSIONS_WRITE",
            delete: "PERMISSIONS_WRITE"
        },
        (context, filter) => filter
    ) {}

    return PermissionsController;
}
