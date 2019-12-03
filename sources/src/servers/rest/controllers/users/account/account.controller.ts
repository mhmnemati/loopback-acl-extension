// import { ACLController } from "src/servers";
// import { Code, User } from "src/models";

// import {
//     post,
//     get,
//     put,
//     del,
//     param,
//     requestBody,
//     getModelSchemaRef
// } from "@loopback/rest";
// import { intercept } from "@loopback/core";
// import { unique } from "src/interceptors";

// const randomize = require("randomatic");

// export class UsersAccountController extends ACLController {
//     @intercept(unique<User>(controller => controller.userRepository, User, 0))
//     @post("/users/account", {
//         responses: {
//             "204": {
//                 description: "Create Account"
//             }
//         }
//     })
//     async create(
//         @requestBody({
//             content: {
//                 "application/json": {
//                     schema: getModelSchemaRef(User, {
//                         exclude: ["uid", "beginDate", "endDate", "id", "status"]
//                     })
//                 }
//             }
//         })
//         user: User
//     ): Promise<void> {
//         /**
//          * 1. Create User
//          * 2. Generate Code And Send
//          */

//         /** Create user */
//         const userObject = await this.userRepository.create(
//             new User({
//                 ...user,
//                 status: "Register"
//             })
//         );

//         /** Generate Code And Send */
//         await this.generateCodeAndSend(userObject.id);
//     }

//     @get("/users/account/{code}", {
//         responses: {
//             "204": {
//                 description: "Register Account"
//             }
//         }
//     })
//     async register(@param.path.string("code") code: string): Promise<void> {
//         /**
//          * 1. Find Code Object
//          * 2. Check Code Object
//          * 3. Activate User
//          */

//         /** Find activation code object */
//         const codeObject = await this.codeRepository.get(code);

//         /** Check activation code object type */
//         if (!codeObject || codeObject.type !== "Account") {
//             throw {
//                 name: "DatabaseError",
//                 status: 404,
//                 message: `Not Found Resource`
//             };
//         }

//         /** Activate user */
//         await this.userRepository.updateById(
//             codeObject.userId,
//             new User({
//                 status: "Active"
//             })
//         );
//     }

//     @put("/users/account", {
//         responses: {
//             "204": {
//                 description: "Register Account"
//             }
//         }
//     })
//     async resend(
//         @requestBody({
//             content: {
//                 "application/json": {
//                     schema: getModelSchemaRef(User, {
//                         exclude: Object.keys(User.definition.properties).filter(
//                             key => key !== "id"
//                         ) as any
//                     })
//                 }
//             }
//         })
//         user: User
//     ): Promise<void> {
//         /**
//          * 1. Find Old Code Object
//          * 2. Invalidate Old Code Object
//          * 3. Generate Code And Send
//          */

//         /** Find activation code object */
//         for await (const code of this.codeRepository.keys()) {
//             const codeObject = await this.codeRepository.get(code);

//             if (
//                 codeObject.type === "Account" &&
//                 codeObject.userId === user.id
//             ) {
//                 await this.codeRepository.delete(code);
//             }
//         }

//         /** Generate Code And Send */
//         await this.generateCodeAndSend(user.id);
//     }

//     @del("/users/account", {
//         responses: {
//             "204": {
//                 description: "Delete Account"
//             }
//         }
//     })
//     async delete(
//         @requestBody({
//             content: {
//                 "application/json": {
//                     schema: getModelSchemaRef(User, {
//                         exclude: Object.keys(User.definition.properties).filter(
//                             key => key !== "username" && key != "password"
//                         ) as any
//                     })
//                 }
//             }
//         })
//         user: User
//     ): Promise<void> {
//         /** Delete user */
//         await this.userRepository.deleteAll({
//             username: user.username,
//             password: user.password
//         });
//     }

//     private async generateCodeAndSend(userId: string) {
//         /**
//          * 1. Generate Code
//          * 2. Save Code Object
//          * 3. Set Code Object Expire-Time
//          * 4. Send Activation Email
//          */

//         /** Generate activation code */
//         const code = randomize("0", 6);

//         /** Save activation code object */
//         await this.codeRepository.set(
//             code,
//             new Code({
//                 type: "Account",
//                 userId: userId
//             })
//         );

//         /** Set activation code object expiration time (in millis) */
//         const ttl = 300e3; // 300 seconds - 5 minutes
//         await this.codeRepository.expire(code, ttl);

//         /** Send activation email */
//         await this.sendEmail(userId, code);
//     }
//     private async sendEmail(userId: string, code: string) {
//         console.log(`Send email to ${userId}: ${code}`);
//     }
// }
