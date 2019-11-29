import { inject } from "@loopback/context";
import { HttpErrors, Request } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { TokenService } from "@loopback/authentication";

import { Session, User } from "@dms/models";
import { SessionRepository, UserRepository } from "@dms/repositories";

import {
    AuthorizationBindings,
    GetUserPermissionsFn
} from "loopback-authorization-extension";

import { Permissions } from "@dms/permissions";

import { randomBytes } from "crypto";

export class BearerTokenService implements TokenService {
    constructor(
        @repository(SessionRepository)
        protected sessionRepository: SessionRepository,
        @repository(UserRepository)
        protected userRepository: UserRepository,
        @inject(AuthorizationBindings.GET_USER_PERMISSIONS_ACTION)
        protected getUserPermissions: GetUserPermissionsFn<Permissions>
    ) {}

    async verifyToken(token: string): Promise<Session | any> {
        if (!token) {
            throw new HttpErrors.Unauthorized(
                `Error verifying token: token is null`
            );
        }

        /** Check session is valid and exists */
        const session = await this.sessionRepository.get(token);
        if (!session) {
            throw new HttpErrors.Unauthorized(
                `Error getting session: session not found`
            );
        }

        /** Update session expiration per request */
        await this.sessionRepository.expire(token, session.ttl);

        return session;
    }

    async generateToken(user: User & Request & any): Promise<string> {
        if (!user) {
            throw new HttpErrors.Unauthorized(
                "Error generating token: user is null"
            );
        }

        /** Find active user */
        const userObject = await this.userRepository.findOne({
            where: {
                username: user.username,
                password: user.password,
                status: "Active"
            }
        });
        if (!userObject) {
            throw new HttpErrors.Unauthorized(
                "Error generating token: user not found"
            );
        }

        /** Generate token */
        const token = randomBytes(48).toString("hex");

        /** Get user permissions */
        const permissions = await this.getUserPermissions(user.id);

        /** Set constants */
        const ttl = 300e3; // 300 seconds
        const ip = user.ip;
        const device = user.headers["user-agent"];

        /** Save session */
        await this.sessionRepository.set(
            token,
            new Session({
                token: token,
                ip: ip,
                date: new Date(),
                ttl: ttl,
                device: device,
                permissions: permissions
            })
        );

        /** Set session expiration time (in millis) */
        await this.sessionRepository.expire(token, ttl);

        return token;
    }
}
