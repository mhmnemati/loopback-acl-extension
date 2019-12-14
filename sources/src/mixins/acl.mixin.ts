import { Context } from "@loopback/context";
import { Class } from "@loopback/repository";
import { CoreBindings } from "@loopback/core";

import { registerAuthenticationStrategy } from "@loopback/authentication";

import { PrivateACLBindings, ACLBindings, findACL } from "../keys";
import { ACLMixinConfig } from "../types";

import {
    BearerTokenService,
    BearerAuthenticationStrategy,
    MessageProvider,
    RegisterProvider
} from "../providers";
import { User, Role, Permission, Session, Code } from "../models";
import {
    UserRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "../repositories";

export function ACLMixin<T extends Class<any>>(superClass: T) {
    const bootObservers = (ctx: Context) => {
        /**
         * Fix: servers start dependency bug
         */
        ctx.bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to({
            orderedGroups: ["servers.REST", "servers.GraphQL"]
        });
    };

    const bootModels = (ctx: Context, configs: ACLMixinConfig) => {
        ctx.bind(PrivateACLBindings.USER_MODEL).to(configs.userModel || User);
        ctx.bind(PrivateACLBindings.ROLE_MODEL).to(configs.roleModel || Role);
        ctx.bind(PrivateACLBindings.PERMISSION_MODEL).to(
            configs.permissionModel || Permission
        );
        ctx.bind(PrivateACLBindings.SESSION_MODEL).to(
            configs.sessionModel || Session
        );
        ctx.bind(PrivateACLBindings.CODE_MODEL).to(configs.codeModel || Code);
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
         * Find, Bind Message Provider
         */
        let messageProvider = findACL(ctx, "MessageProvider");
        if (messageProvider) {
            ctx.bind(PrivateACLBindings.MESSAGE_PROVIDER).to(messageProvider);
        } else {
            ctx.bind(PrivateACLBindings.MESSAGE_PROVIDER).toProvider(
                MessageProvider
            );
        }

        /**
         * Find, Bind Register Provider
         */
        let registerProvider = findACL(ctx, "RegisterProvider");
        if (registerProvider) {
            ctx.bind(PrivateACLBindings.REGISTER_PROVIDER).to(registerProvider);
        } else {
            ctx.bind(PrivateACLBindings.REGISTER_PROVIDER).toProvider(
                RegisterProvider
            );
        }

        /**
         * Bind Authentication Strategy Provider
         */
        registerAuthenticationStrategy(ctx, BearerAuthenticationStrategy);
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

    const bootRepositories = (ctx: Context) => {
        /**
         * Find, Bind User Repository
         */
        let userRepository = findACL(ctx, "UserRepository");
        if (userRepository) {
            ctx.bind(ACLBindings.USER_REPOSITORY).to(userRepository);
        } else {
            ctx.bind(ACLBindings.USER_REPOSITORY)
                .toClass(UserRepository)
                .tag("repository");
        }

        /**
         * Find, Bind Role Repository
         */
        let roleRepository = findACL(ctx, "RoleRepository");
        if (roleRepository) {
            ctx.bind(ACLBindings.ROLE_REPOSITORY).to(roleRepository);
        } else {
            ctx.bind(ACLBindings.ROLE_REPOSITORY)
                .toClass(RoleRepository)
                .tag("repository");
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
            ctx.bind(ACLBindings.PERMISSION_REPOSITORY)
                .toClass(PermissionRepository)
                .tag("repository");
        }

        /**
         * Find, Bind Session Repository
         */
        let sessionRepository = findACL(ctx, "SessionRepository");
        if (sessionRepository) {
            ctx.bind(ACLBindings.SESSION_REPOSITORY).to(sessionRepository);
        } else {
            ctx.bind(ACLBindings.SESSION_REPOSITORY)
                .toClass(SessionRepository)
                .tag("repository");
        }

        /**
         * Find, Bind Code Repository
         */
        let codeRepository = findACL(ctx, "CodeRepository");
        if (codeRepository) {
            ctx.bind(ACLBindings.CODE_REPOSITORY).to(codeRepository);
        } else {
            ctx.bind(ACLBindings.CODE_REPOSITORY)
                .toClass(CodeRepository)
                .tag("repository");
        }
    };

    return class extends superClass {
        public aclConfigs: ACLMixinConfig = {};

        async boot() {
            bootObservers(this as any);

            await super.boot();

            bootModels(this as any, this.aclConfigs);
            bootProviders(this as any);
            bootDataSources(this as any);
            bootRepositories(this as any);
        }
    };
}
