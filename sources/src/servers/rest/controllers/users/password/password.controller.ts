import { ACLController } from "@acl/servers/rest/controller";
import { Code, User } from "@acl/models";

import {
    get,
    put,
    param,
    requestBody,
    getModelSchemaRef
} from "@loopback/rest";

const randomize = require("randomatic");

export class UsersPasswordController extends ACLController {
    @get("/users/password/{code}", {
        responses: {
            "204": {
                description: "Reset Password"
            }
        }
    })
    async reset(
        @param.path.string("code") code: string,
        @requestBody({
            content: {
                "application/json": {
                    schema: getModelSchemaRef(User, {
                        exclude: Object.keys(User.definition.properties).filter(
                            key => key !== "password"
                        ) as any
                    })
                }
            }
        })
        user: User
    ): Promise<void> {
        /**
         * 1. Find Code Object
         * 2. Check Code Object
         * 3. Change Password
         */

        /** Find activation code object */
        const codeObject = await this.codeRepository.get(code);

        /** Check activation code object type */
        if (!codeObject || codeObject.type !== "Password") {
            throw {
                name: "DatabaseError",
                status: 404,
                message: `Not Found Resource`
            };
        }

        /** Change password */
        await this.userRepository.updateById(
            codeObject.userId,
            new User({
                password: user.password
            })
        );
    }

    @put("/users/password", {
        responses: {
            "204": {
                description: "Request Reset Password"
            }
        }
    })
    async resend(
        @requestBody({
            content: {
                "application/json": {
                    schema: getModelSchemaRef(User, {
                        exclude: Object.keys(User.definition.properties).filter(
                            key => key !== "username" && key != "email"
                        ) as any
                    })
                }
            }
        })
        user: User
    ): Promise<void> {
        /**
         * 1. Find User
         * 2. Find Old Code Object
         * 3. Invalidate Old Code Object
         * 4. Generate Code And Send
         */

        /** Find user object by username or email */
        const userObject = await this.userRepository.findOne({
            where: {
                or: [{ username: user.username }, { email: user.email }]
            }
        });
        if (!userObject) {
            throw {
                name: "DatabaseError",
                status: 404,
                message: `Not Found Resource`
            };
        }

        /** Find activation code object */
        for await (const code of this.codeRepository.keys()) {
            const codeObject = await this.codeRepository.get(code);

            if (
                codeObject.type === "Password" &&
                codeObject.userId === userObject.id
            ) {
                await this.codeRepository.delete(code);
            }
        }

        /** Generate Code And Send */
        await this.generateCodeAndSend(userObject.id);
    }

    private async generateCodeAndSend(userId: string) {
        /**
         * 1. Generate Code
         * 2. Save Code Object
         * 3. Set Code Object Expire-Time
         * 4. Send Activation Email
         */

        /** Generate activation code */
        const code = randomize("0", 6);

        /** Save activation code object */
        await this.codeRepository.set(
            code,
            new Code({
                type: "Password",
                userId: userId
            })
        );

        /** Set activation code object expiration time (in millis) */
        const ttl = 300e3; // 300 seconds - 5 minutes
        await this.codeRepository.expire(code, ttl);

        /** Send activation email */
        await this.sendEmail(userId, code);
    }
    private async sendEmail(userId: string, code: string) {
        console.log(`Send email to ${userId}: ${code}`);
    }
}
