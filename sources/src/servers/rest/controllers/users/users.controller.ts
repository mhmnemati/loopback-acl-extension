import { ACLControllerMixin } from "@acl/servers/rest/crud.mixin";
import { User } from "@acl/models";

export class UsersController extends ACLControllerMixin<User>(
    User,
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
