// import { ACLController } from "src/servers";
// import { Session, Token, User } from "src/models";

// import { post, get, del, requestBody, getModelSchemaRef } from "@loopback/rest";
// import { authenticate } from "@loopback/authentication";

// export class UsersSessionController extends ACLController {
//     @post("/users/session", {
//         responses: {
//             "200": {
//                 description: "Create Session",
//                 content: {
//                     "application/json": {
//                         schema: getModelSchemaRef(Token, {
//                             includeRelations: true
//                         })
//                     }
//                 }
//             }
//         }
//     })
//     async signIn(
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
//     ): Promise<Token> {
//         const token = await this.tokenService.generateToken({
//             ...this.request,
//             ...user
//         });

//         return new Token({
//             token: token
//         });
//     }

//     @authenticate("bearer")
//     @get("/users/session", {
//         responses: {
//             "200": {
//                 description: "Get Session",
//                 content: {
//                     "application/json": {
//                         schema: getModelSchemaRef(Session, {
//                             includeRelations: true
//                         })
//                     }
//                 }
//             }
//         }
//     })
//     async sign(): Promise<Session> {
//         return this.session;
//     }

//     @authenticate("bearer")
//     @del("/users/session", {
//         responses: {
//             "204": {
//                 description: "Delete Session"
//             }
//         }
//     })
//     async signOut(): Promise<void> {
//         await this.sessionRepository.delete(this.session.token);
//     }
// }
