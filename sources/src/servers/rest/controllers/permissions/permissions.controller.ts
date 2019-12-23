import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "../../../../servers";
import { Permission } from "../../../../models";

export function GeneratePermissionsController<Model extends Permission>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class PermissionsController extends ACLCRUDControllerMixin<
        ACLController,
        Permission
    >(
        ACLController,
        ctor,
        "id",
        "/permissions",
        controller => controller.permissionRepository,
        {
            create: {
                permission: "PERMISSIONS_WRITE"
            },
            read: {
                permission: "PERMISSIONS_READ",
                filter: (context, filter) => filter
            },
            update: {
                permission: "PERMISSIONS_WRITE",
                filter: (context, filter) => filter
            },
            delete: {
                permission: "PERMISSIONS_WRITE",
                filter: (context, filter) => filter
            },
            history: {
                permission: "PERMISSIONS_READ",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return PermissionsController;
}
