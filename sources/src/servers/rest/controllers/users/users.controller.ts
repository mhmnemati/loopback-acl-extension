import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { ACLControllerMixin } from "@acl/servers/rest/crud.mixin";
import { ACLController } from "@acl/servers/rest/controller";
import { User } from "@acl/models";

export function GenerateUsersController<Model extends User>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class UsersController extends ACLControllerMixin<User>(
        ctor,
        "/users",
        controller => controller.userRepository,
        {
            create: "USERS_WRITE",
            read: "USERS_READ",
            update: "USERS_WRITE",
            delete: "USERS_WRITE"
        },
        (context, filter) => filter
    ) {}

    return UsersController;
}
