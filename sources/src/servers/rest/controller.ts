import { inject } from "@loopback/context";
import { Request, RestBindings, SchemaObject } from "@loopback/rest";
import { AuthenticationBindings, TokenService } from "@loopback/authentication";
import {
    UserGroupRepository,
    UserRoleRepository,
    GroupRoleRepository,
    RolePermissionRepository
} from "loopback-authorization-extension";

import { PrivateACLBindings, ACLBindings } from "../../keys";

import {
    UserRepository,
    GroupRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "../../repositories";

import {
    User,
    UserRelations,
    Group,
    GroupRelations,
    Role,
    RoleRelations,
    Permission,
    PermissionRelations,
    Session,
    Code
} from "../../models";

export class ACLController {
    constructor(
        @inject(RestBindings.Http.REQUEST)
        public request: Request,
        @inject(PrivateACLBindings.TOKEN_PROVIDER)
        public tokenService: TokenService,
        @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
        public session: Session,

        @inject(ACLBindings.USER_REPOSITORY)
        public userRepository: UserRepository<User, UserRelations>,
        @inject(ACLBindings.GROUP_REPOSITORY)
        public groupRepository: GroupRepository<Group, GroupRelations>,
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

        @inject(ACLBindings.USER_GROUP_REPOSITORY)
        public userGroupRepository: UserGroupRepository,
        @inject(ACLBindings.USER_ROLE_REPOSITORY)
        public userRoleRepository: UserRoleRepository,
        @inject(ACLBindings.GROUP_ROLE_REPOSITORY)
        public groupRoleRepository: GroupRoleRepository,
        @inject(ACLBindings.ROLE_PERMISSION_REPOSITORY)
        public rolePermissionRepository: RolePermissionRepository
    ) {}
}

/** Fix getModelSchemaRef */
/** Fix getFilterSchemaFor */
/** Fix getWhereSchemaFor */
import {
    getFilterSchemaFor as getFilterSchemaForBad,
    Model
} from "@loopback/rest";

export function getFilterSchemaFor(modelCtor: typeof Model): SchemaObject {
    let result: any = getFilterSchemaForBad(modelCtor);

    /** Fix additionalProperties for graphql schema */
    delete result.properties.limit.examples;

    return result;
}
