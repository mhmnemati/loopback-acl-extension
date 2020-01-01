import { inject } from "@loopback/context";
import { Request, RestBindings } from "@loopback/rest";
import { AuthenticationBindings } from "@loopback/authentication";

import {
    UserRepository,
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    RolePermissionRepository
} from "loopback-authorization-extension";

import { BearerTokenService } from "../../providers";
import { MessageHandler, ActivateHandler } from "../../types";
import { PrivateACLBindings, ACLBindings } from "../../keys";

import { SessionRepository, CodeRepository } from "../../repositories";

import {
    User,
    UserRelations,
    Role,
    RoleRelations,
    Permission,
    PermissionRelations,
    UserRole,
    UserRoleRelations,
    RolePermission,
    RolePermissionRelations,
    Session,
    Code
} from "../../models";

export class ACLController {
    constructor(
        @inject(PrivateACLBindings.SESSION_TIMEOUT_CONSTANT)
        public sessionTimeout: number,

        @inject(RestBindings.Http.REQUEST)
        public request: Request,
        @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
        public session: Session,

        @inject(PrivateACLBindings.TOKEN_PROVIDER)
        public tokenService: BearerTokenService,
        @inject(PrivateACLBindings.MESSAGE_PROVIDER)
        public messageHandler: MessageHandler,
        @inject(PrivateACLBindings.ACTIVATE_PROVIDER)
        public activateHandler: ActivateHandler,

        @inject(ACLBindings.USER_REPOSITORY)
        public userRepository: UserRepository<User, UserRelations>,
        @inject(ACLBindings.ROLE_REPOSITORY)
        public roleRepository: RoleRepository<Role, RoleRelations>,
        @inject(ACLBindings.PERMISSION_REPOSITORY)
        public permissionRepository: PermissionRepository<
            Permission,
            PermissionRelations
        >,
        @inject(ACLBindings.USER_ROLE_REPOSITORY)
        public userRoleRepository: UserRoleRepository<
            UserRole,
            UserRoleRelations
        >,
        @inject(ACLBindings.ROLE_PERMISSION_REPOSITORY)
        public rolePermissionRepository: RolePermissionRepository<
            RolePermission,
            RolePermissionRelations
        >,
        @inject(ACLBindings.SESSION_REPOSITORY)
        public sessionRepository: SessionRepository<Session>,
        @inject(ACLBindings.CODE_REPOSITORY)
        public codeRepository: CodeRepository<Code>
    ) {}
}
