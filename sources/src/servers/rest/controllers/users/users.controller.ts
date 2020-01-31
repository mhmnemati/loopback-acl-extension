import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLPermissions } from "../../../../types";

import { ACLController, ACLControllerMixin } from "../../../../servers";
import { User } from "../../../../models";

export function GenerateUsersController<Model extends User>(
    ctor: Ctor<Model>
): Class<ACLController> {
    class UsersController extends ACLControllerMixin<
        User,
        ACLPermissions,
        ACLController
    >(
        ACLController,
        ctor,
        {
            repositoryGetter: controller => controller.userRepository,
            read: ["USERS_READ", async (context, where) => where],
            include: {
                userRoles: {
                    repositoryGetter: controller =>
                        controller.userRoleRepository,
                    read: ["USER_ROLES_READ", async (context, where) => where],
                    include: {
                        role: {
                            repositoryGetter: controller =>
                                controller.roleRepository,
                            read: [
                                "ROLES_READ",
                                async (context, where) => where
                            ],
                            include: {
                                rolePermissions: {
                                    repositoryGetter: controller =>
                                        controller.rolePermissionRepository,
                                    read: [
                                        "ROLE_PERMISSIONS_READ",
                                        async (context, where) => where
                                    ],
                                    include: {}
                                }
                            }
                        }
                    }
                }
            }
        },
        ""
    ) {}

    return UsersController;
}
