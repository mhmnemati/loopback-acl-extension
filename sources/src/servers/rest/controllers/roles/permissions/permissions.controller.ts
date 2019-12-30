import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "../../../../../servers";
import { RolePermission } from "../../../../../models";

export function GenerateRolesPermissionsController<
    Model extends RolePermission
>(ctor: Ctor<Model>): Class<ACLController> {
    class RolesPermissionsController extends ACLCRUDControllerMixin<
        ACLController,
        RolePermission
    >(
        ACLController,
        ctor,
        "id",
        "/roles/permissions",
        controller => controller.rolePermissionRepository
    ) {}

    return RolesPermissionsController;
}
