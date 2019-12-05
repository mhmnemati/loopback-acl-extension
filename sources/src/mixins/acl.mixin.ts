import { Context } from "@loopback/context";
import { Class } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { registerAuthenticationStrategy } from "@loopback/authentication";

import { PrivateACLBindings, ACLBindings, findACL } from "~/keys";
import { ACLPermissions } from "~/types";

import { User, Group, Role, Permission, Session, Code } from "~/models";
import {
    UserRepository,
    GroupRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "~/repositories";

import { BearerTokenService, BearerAuthenticationStrategy } from "~/providers";

export function AuthorizationMixin<T extends Class<any>>(baseClass: T) {
    const bootModels = (ctx: Context, configs: AuthorizationMixinConfigs) => {
        ctx.bind(PrivateACLBindings.USER_MODEL).to(configs.userModel || User);
        ctx.bind(PrivateACLBindings.GROUP_MODEL).to(
            configs.groupModel || Group
        );
        ctx.bind(PrivateACLBindings.ROLE_MODEL).to(configs.roleModel || Role);
        ctx.bind(PrivateACLBindings.PERMISSION_MODEL).to(
            configs.permissionModel || Permission
        );
        ctx.bind(PrivateACLBindings.SESSION_MODEL).to(
            configs.sessionModel || Session
        );
        ctx.bind(PrivateACLBindings.CODE_MODEL).to(configs.codeModel || Code);
    };

    const bootDataSources = (ctx: Context) => {
        let relationalDataSource = findACL(ctx, "RelationalDataSource");
        if (relationalDataSource) {
            ctx.bind(PrivateACLBindings.RELATIONAL_DATASOURCE).to(
                relationalDataSource
            );
        } else {
            throw new Error("ACLComponent: Relational dataSource not found!");
        }

        let cacheDataSource = findACL(ctx, "CacheDataSource");
        if (cacheDataSource) {
            ctx.bind(PrivateACLBindings.CACHE_DATASOURCE).to(cacheDataSource);
        } else {
            throw new Error("ACLComponent: Cache dataSource not found!");
        }
    };

    const bootProviders = (ctx: Context) => {
        /**
         * Find, Bind Authentication Token Provider
         */
        let tokenProvider = findACL(ctx, "TokenProvider");
        if (tokenProvider) {
            ctx.bind(PrivateACLBindings.TOKEN_PROVIDER).to(tokenProvider);
        } else {
            ctx.bind(PrivateACLBindings.TOKEN_PROVIDER).toClass(
                BearerTokenService
            );
        }

        /**
         * Bind Authentication Strategy Provider
         */
        registerAuthenticationStrategy(ctx, BearerAuthenticationStrategy);
    };

    const bootRepositories = (ctx: Context) => {
        /**
         * Find, Bind User Repository
         */
        let userRepository = findACL(ctx, "UserRepository");
        if (userRepository) {
            ctx.bind(ACLBindings.USER_REPOSITORY).to(userRepository);
        } else {
            ctx.bind(ACLBindings.USER_REPOSITORY).toClass(UserRepository);
        }

        /**
         * Find, Bind Group Repository
         */
        let groupRepository = findACL(ctx, "GroupRepository");
        if (groupRepository) {
            ctx.bind(ACLBindings.GROUP_REPOSITORY).to(groupRepository);
        } else {
            ctx.bind(ACLBindings.GROUP_REPOSITORY).toClass(GroupRepository);
        }

        /**
         * Find, Bind Role Repository
         */
        let roleRepository = findACL(ctx, "RoleRepository");
        if (roleRepository) {
            ctx.bind(ACLBindings.ROLE_REPOSITORY).to(roleRepository);
        } else {
            ctx.bind(ACLBindings.ROLE_REPOSITORY).toClass(RoleRepository);
        }

        /**
         * Find, Bind Permission Repository
         */
        let permissionRepository = findACL(ctx, "PermissionRepository");
        if (permissionRepository) {
            ctx.bind(ACLBindings.PERMISSION_REPOSITORY).to(
                permissionRepository
            );
        } else {
            ctx.bind(ACLBindings.PERMISSION_REPOSITORY).toClass(
                PermissionRepository
            );
        }

        /**
         * Find, Bind Session Repository
         */
        let sessionRepository = findACL(ctx, "SessionRepository");
        if (sessionRepository) {
            ctx.bind(ACLBindings.SESSION_REPOSITORY).to(sessionRepository);
        } else {
            ctx.bind(ACLBindings.SESSION_REPOSITORY).toClass(SessionRepository);
        }

        /**
         * Find, Bind Code Repository
         */
        let codeRepository = findACL(ctx, "CodeRepository");
        if (codeRepository) {
            ctx.bind(ACLBindings.CODE_REPOSITORY).to(codeRepository);
        } else {
            ctx.bind(ACLBindings.CODE_REPOSITORY).toClass(CodeRepository);
        }
    };

    return class extends baseClass {
        async boot() {
            await super.boot();

            bootModels(this as any, configs);
            bootDataSources(this as any);
            bootProviders(this as any);
            bootRepositories(this as any);
        }
    };
}
