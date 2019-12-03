import { CoreBindings } from "@loopback/core";
import { AuthorizationApplication } from "loopback-authorization-extension";

import { registerAuthenticationStrategy } from "@loopback/authentication";

import { PrivateACLBindings, ACLBindings, findACL } from "@acl/keys";
import { ACLApplicationConfig } from "@acl/types";

import { User, Group, Role, Permission, Session, Code } from "@acl/models";
import {
    UserRepository,
    GroupRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "@acl/repositories";

import {
    BearerTokenService,
    BearerAuthenticationStrategy
} from "@acl/providers";

export class ACLApplication extends AuthorizationApplication {
    constructor(public options: ACLApplicationConfig = {}) {
        super(options);
    }

    async boot() {
        this.bootACLObservers();

        await super.boot();

        this.bootACLModels();
        this.bootACLDataSources();
        this.bootACLProviders();
        this.bootACLRepositories();
    }

    private bootACLObservers() {
        /**
         * Fix: servers start dependency bug
         */
        this.bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to({
            orderedGroups: ["servers.REST", "servers.GraphQL"]
        });
    }

    private bootACLModels() {
        this.bind(PrivateACLBindings.USER_MODEL).to(
            this.options.userModel || User
        );
        this.bind(PrivateACLBindings.GROUP_MODEL).to(
            this.options.groupModel || Group
        );
        this.bind(PrivateACLBindings.ROLE_MODEL).to(
            this.options.roleModel || Role
        );
        this.bind(PrivateACLBindings.PERMISSION_MODEL).to(
            this.options.permissionModel || Permission
        );
        this.bind(PrivateACLBindings.SESSION_MODEL).to(
            this.options.sessionModel || Session
        );
        this.bind(PrivateACLBindings.CODE_MODEL).to(
            this.options.codeModel || Code
        );
    }

    private bootACLDataSources() {
        let relationalDataSource = findACL(this as any, "RelationalDataSource");
        if (relationalDataSource) {
            this.bind(PrivateACLBindings.RELATIONAL_DATASOURCE).to(
                relationalDataSource
            );
        } else {
            throw new Error("ACLComponent: Relational dataSource not found!");
        }

        let cacheDataSource = findACL(this as any, "CacheDataSource");
        if (cacheDataSource) {
            this.bind(PrivateACLBindings.CACHE_DATASOURCE).to(cacheDataSource);
        } else {
            throw new Error("ACLComponent: Cache dataSource not found!");
        }
    }

    private bootACLProviders() {
        /**
         * Find, Bind Authentication Token Provider
         */
        let tokenProvider = findACL(this as any, "TokenProvider");
        if (tokenProvider) {
            this.bind(PrivateACLBindings.TOKEN_PROVIDER).to(tokenProvider);
        } else {
            this.bind(PrivateACLBindings.TOKEN_PROVIDER).toClass(
                BearerTokenService
            );
        }

        /**
         * Bind Authentication Strategy Provider
         */
        registerAuthenticationStrategy(
            this as any,
            BearerAuthenticationStrategy
        );
    }

    private bootACLRepositories() {
        /**
         * Find, Bind User Repository
         */
        let userRepository = findACL(this as any, "UserRepository");
        if (userRepository) {
            this.bind(ACLBindings.USER_REPOSITORY).to(userRepository);
        } else {
            this.bind(ACLBindings.USER_REPOSITORY).toClass(UserRepository);
        }

        /**
         * Find, Bind Group Repository
         */
        let groupRepository = findACL(this as any, "GroupRepository");
        if (groupRepository) {
            this.bind(ACLBindings.GROUP_REPOSITORY).to(groupRepository);
        } else {
            this.bind(ACLBindings.GROUP_REPOSITORY).toClass(GroupRepository);
        }

        /**
         * Find, Bind Role Repository
         */
        let roleRepository = findACL(this as any, "RoleRepository");
        if (roleRepository) {
            this.bind(ACLBindings.ROLE_REPOSITORY).to(roleRepository);
        } else {
            this.bind(ACLBindings.ROLE_REPOSITORY).toClass(RoleRepository);
        }

        /**
         * Find, Bind Permission Repository
         */
        let permissionRepository = findACL(this as any, "PermissionRepository");
        if (permissionRepository) {
            this.bind(ACLBindings.PERMISSION_REPOSITORY).to(
                permissionRepository
            );
        } else {
            this.bind(ACLBindings.PERMISSION_REPOSITORY).toClass(
                PermissionRepository
            );
        }

        /**
         * Find, Bind Session Repository
         */
        let sessionRepository = findACL(this as any, "SessionRepository");
        if (sessionRepository) {
            this.bind(ACLBindings.SESSION_REPOSITORY).to(sessionRepository);
        } else {
            this.bind(ACLBindings.SESSION_REPOSITORY).toClass(
                SessionRepository
            );
        }

        /**
         * Find, Bind Code Repository
         */
        let codeRepository = findACL(this as any, "CodeRepository");
        if (codeRepository) {
            this.bind(ACLBindings.CODE_REPOSITORY).to(codeRepository);
        } else {
            this.bind(ACLBindings.CODE_REPOSITORY).toClass(CodeRepository);
        }
    }
}
