import { Entity, Class } from "@loopback/repository";
import { ACLControllerMixin } from "@acl/servers/rest/crud.mixin";
import { ACLController } from "@acl/servers/rest/controller";
import { User } from "@acl/models";

export function GenerateUsersController<UserModel extends User>(
    ctor: typeof Entity & { prototype: UserModel }
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
