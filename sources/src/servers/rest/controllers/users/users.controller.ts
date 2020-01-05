import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLControllerMixin } from "../../../../servers";
import { User } from "../../../../models";

export function GenerateUsersController<Model extends User>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class UsersController extends ACLControllerMixin<ACLController, User>(
        ACLController,
        ctor,
        "id",
        "/users",
        controller => controller.userRepository
    ) {}

    return UsersController;
}
