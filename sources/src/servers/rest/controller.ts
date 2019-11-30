import { inject } from "@loopback/context";
import { repository } from "@loopback/repository";
import { Request, RestBindings, SchemaObject } from "@loopback/rest";

import { AuthenticationBindings } from "@loopback/authentication";

import { ACLBindings } from "@acl/keys";

import { BearerTokenService } from "@acl/providers";
import { Session } from "@acl/models";
import {
    UserRepository,
    GroupRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "@acl/repositories";
import {
    UserGroupRepository,
    UserRoleRepository,
    GroupRoleRepository,
    RolePermissionRepository
} from "loopback-authorization-extension";

export class ACLController {
    constructor(
        @inject(RestBindings.Http.REQUEST)
        public request: Request,
        @inject(ACLBindings.TOKEN_SERVICE)
        public tokenService: BearerTokenService,
        @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
        public session: Session,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(GroupRepository)
        public groupRepository: GroupRepository,
        @repository(RoleRepository)
        public roleRepository: RoleRepository,
        @repository(PermissionRepository)
        public permissionRepository: PermissionRepository,
        @repository(SessionRepository)
        public sessionRepository: SessionRepository,
        @repository(CodeRepository)
        public codeRepository: CodeRepository,
        @repository(UserGroupRepository)
        public userGroupRepository: UserGroupRepository,
        @repository(UserRoleRepository)
        public userRoleRepository: UserRoleRepository,
        @repository(GroupRoleRepository)
        public groupRoleRepository: GroupRoleRepository,
        @repository(RolePermissionRepository)
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
