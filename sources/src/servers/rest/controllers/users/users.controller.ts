import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController, ACLCRUDControllerMixin } from "../../../../servers";
import { User } from "../../../../models";

export function GenerateUsersController<Model extends User>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class UsersController extends ACLCRUDControllerMixin<User>(
        ctor,
        "id",
        "/users",
        controller => controller.userRepository,
        {
            create: {
                permission: "USERS_WRITE"
            },
            read: {
                permission: "USERS_READ",
                filter: (context, filter) => filter
            },
            update: {
                permission: "USERS_WRITE",
                filter: (context, filter) => filter
            },
            delete: {
                permission: "USERS_WRITE",
                filter: (context, filter) => filter
            },
            history: {
                permission: "USERS_HISTORY",
                filter: (context, filter) => filter
            }
        }
    ) {}

    return UsersController;
}
