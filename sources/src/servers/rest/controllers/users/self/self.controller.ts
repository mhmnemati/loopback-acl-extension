import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { get, put, requestBody, getModelSchemaRef } from "@loopback/rest";
import { authenticate } from "@loopback/authentication";
import { authorize } from "loopback-authorization-extension";

import { ACLController } from "~/servers";
import { User } from "~/models";

import { ACLPermissions } from "~/types";

import { intercept } from "@loopback/core";
import { unique } from "~/interceptors";

export function GenerateUsersSelfController<UserModel extends User>(
    userCtor: Ctor<UserModel>
): Class<ACLController> {
    class UsersSelfController extends ACLController {
        @authorize<ACLPermissions>("USERS_READ_SELF")
        @authenticate("bearer")
        @get("/users/self", {
            responses: {
                "200": {
                    description: `Read self`,
                    content: {
                        "application/json": {
                            schema: getModelSchemaRef(userCtor, {
                                includeRelations: true
                            })
                        }
                    }
                }
            }
        })
        async read(): Promise<User> {
            return await this.userRepository.findById(this.session.userId);
        }

        @intercept(
            unique<UserModel>(
                controller => controller.userRepository,
                userCtor,
                0
            )
        )
        @authorize<ACLPermissions>("USERS_WRITE_SELF")
        @authenticate("bearer")
        @put("/users/self", {
            responses: {
                "204": {
                    description: `Update self`
                }
            }
        })
        async update(
            @requestBody({
                content: {
                    "application/json": {
                        schema: getModelSchemaRef(userCtor, { partial: true })
                    }
                }
            })
            user: User
        ): Promise<void> {
            await this.userRepository.updateById(this.session.userId, user);
        }
    }

    return UsersSelfController;
}
