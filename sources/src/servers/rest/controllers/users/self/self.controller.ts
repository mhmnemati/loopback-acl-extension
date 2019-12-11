import { Class, Filter } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import {
    get,
    put,
    param,
    requestBody,
    getModelSchemaRef,
    getFilterSchemaFor
} from "@loopback/rest";
import { authenticate } from "@loopback/authentication";
import { authorize } from "loopback-authorization-extension";

import { ACLController } from "../../../../../servers";
import { User } from "../../../../../models";

import { ACLPermissions } from "../../../../../types";

import { intercept } from "@loopback/core";
import { unique, filter } from "../../../../../interceptors";

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

        @intercept(
            filter(0, "filter", (context, filter) => filter, 0, "filter", {
                arg: context =>
                    (context.target as ACLController).session.userId,
                property: "id"
            })
        )
        @authorize<ACLPermissions>("USERS_HISTORY_SELF")
        @authenticate("bearer")
        @get("/users/self/history", {
            responses: {
                "200": {
                    description: `Get self history by filter`,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: getModelSchemaRef(userCtor, {
                                    includeRelations: true
                                })
                            }
                        }
                    }
                }
            }
        })
        async history(
            @param.query.object("filter", getFilterSchemaFor(userCtor), {
                description: `Filter self`
            })
            filter?: Filter<UserModel>
        ): Promise<User[]> {
            return await this.userRepository.find(filter);
        }
    }

    return UsersSelfController;
}
