import { DMSControllerMixin } from "@dms/servers/rest/crud.mixin";
import { User } from "@dms/models";

export class UsersController extends DMSControllerMixin<User>(
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
