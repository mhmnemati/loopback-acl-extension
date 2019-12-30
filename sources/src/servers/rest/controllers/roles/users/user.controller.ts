import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "../../../..";
import { UserRole } from "../../../../../models";

export function GenerateRolesUsersController<Model extends UserRole>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class RolesUsersController extends ACLCRUDControllerMixin<
        ACLController,
        UserRole
    >(
        ACLController,
        ctor,
        "id",
        "/roles/users",
        controller => controller.userRoleRepository
    ) {}

    return RolesUsersController;
}
