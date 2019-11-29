import { DMSController } from "@dms/servers/rest/controller";
import { User } from "@dms/models";

import { get, put, requestBody, getModelSchemaRef } from "@loopback/rest";
import { authenticate } from "@loopback/authentication";
import { authorize } from "loopback-authorization-extension";
import { Permissions } from "@dms/permissions";
import { intercept } from "@loopback/core";
import { unique } from "@dms/interceptors";

export class UsersSelfController extends DMSController {
    @authorize<Permissions>("USERS_READ_SELF")
    @authenticate("bearer")
    @get("/users/self", {
        responses: {
            "204": {
                description: `Read self`
            }
        }
    })
    async read(): Promise<User> {
        return await this.userRepository.findById(this.session.userId);
    }

    @intercept(unique<User>(controller => controller.userRepository, User, 0))
    @authorize<Permissions>("USERS_WRITE_SELF")
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
                    schema: getModelSchemaRef(User, { partial: true })
                }
            }
        })
        user: User
    ): Promise<void> {
        await this.userRepository.updateById(this.session.userId, user);
    }
}
