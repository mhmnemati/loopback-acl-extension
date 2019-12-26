import { inject } from "@loopback/context";
import { Request, RestBindings } from "@loopback/rest";
import { AuthenticationBindings } from "@loopback/authentication";
import { BearerTokenService } from "../../providers";
import { MessageHandler, ActivateHandler } from "../../types";
import {
    AuthorizationBindings,
    UserRoleRepository,
    RolePermissionRepository
} from "loopback-authorization-extension";

import { PrivateACLBindings, ACLBindings } from "../../keys";

import {
    UserRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "../../repositories";

import {
    User,
    UserRelations,
    Role,
    RoleRelations,
    Permission,
    PermissionRelations,
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
        @inject(ACLBindings.SESSION_REPOSITORY)
        public sessionRepository: SessionRepository<Session>,
        @inject(ACLBindings.CODE_REPOSITORY)
        public codeRepository: CodeRepository<Code>,

        @inject(AuthorizationBindings.USER_ROLE_REPOSITORY)
        public userRoleRepository: UserRoleRepository,
        @inject(AuthorizationBindings.ROLE_PERMISSION_REPOSITORY)
        public rolePermissionRepository: RolePermissionRepository
    ) {}
}
