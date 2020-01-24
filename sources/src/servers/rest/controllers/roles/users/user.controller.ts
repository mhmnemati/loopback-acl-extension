import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLControllerMixin } from "../../../..";
import { UserRole } from "../../../../../models";

export function GenerateRolesUsersController<Model extends UserRole>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class RolesUsersController extends ACLControllerMixin<
        UserRole,
        ACLController
    >(
        ACLController,
        ctor,
        // "id",
        "/roles/users",
        // controller => controller.userRoleRepository
        null
    ) {}

    return RolesUsersController;
}
