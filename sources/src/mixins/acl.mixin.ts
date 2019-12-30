import { Context } from "@loopback/context";
import { Class, SchemaMigrationOptions } from "@loopback/repository";
import { CoreBindings } from "@loopback/core";

import { registerAuthenticationStrategy } from "@loopback/authentication";

import { findACL, ACLBindings, PrivateACLBindings } from "../keys";
import { ACLMixinConfig } from "../types";

import {
    BearerTokenService,
    BearerAuthenticationStrategy,
    MessageProvider,
    ActivateProvider
} from "../providers";
import {
    User,
    Role,
    Permission,
    UserRole,
    RolePermission,
    Session,
    Code
} from "../models";
import {
    UserRepository,
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    RolePermissionRepository,
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
        ctx.bind(PrivateACLBindings.USER_ROLE_MODEL).to(
            configs.userRoleModel || UserRole
        );
        ctx.bind(PrivateACLBindings.ROLE_PERMISSION_MODEL).to(
            configs.rolePermissionModel || RolePermission
        );

        ctx.bind(PrivateACLBindings.SESSION_MODEL).to(
            configs.sessionModel || Session
        );
        ctx.bind(PrivateACLBindings.CODE_MODEL).to(configs.codeModel || Code);
    };

    const bootProviders = (ctx: Context, configs: ACLMixinConfig) => {
        ctx.bind(PrivateACLBindings.TOKEN_PROVIDER).toClass(
            configs.tokenProvider || BearerTokenService
        );
        ctx.bind(PrivateACLBindings.MESSAGE_PROVIDER).toProvider(
            configs.messageProvider || MessageProvider
        );
        ctx.bind(PrivateACLBindings.ACTIVATE_PROVIDER).toProvider(
            configs.activateProvider || ActivateProvider
        );

        registerAuthenticationStrategy(ctx, BearerAuthenticationStrategy);
    };

    const bootConstants = (ctx: Context, configs: ACLMixinConfig) => {
        ctx.bind(PrivateACLBindings.SESSION_TIMEOUT_CONSTANT).to(
            configs.sessionTimeout
        );
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
         * Find, Bind UserRole Repository
         */
        let userRoleRepository = findACL(ctx, "UserRoleRepository");
        if (userRoleRepository) {
            ctx.bind(ACLBindings.USER_ROLE_REPOSITORY).to(userRoleRepository);
        } else {
            ctx.bind(ACLBindings.USER_ROLE_REPOSITORY)
                .toClass(UserRoleRepository)
                .tag("repository");
        }

        /**
         * Find, Bind RolePermission Repository
         */
        let rolePermissionRepository = findACL(ctx, "RolePermissionRepository");
        if (rolePermissionRepository) {
            ctx.bind(ACLBindings.ROLE_PERMISSION_REPOSITORY).to(
                rolePermissionRepository
            );
        } else {
            ctx.bind(ACLBindings.ROLE_PERMISSION_REPOSITORY)
                .toClass(RolePermissionRepository)
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

    const migrateUsers = async (ctx: Context, configs: ACLMixinConfig) => {
        const userRepository = ctx.getSync(ACLBindings.USER_REPOSITORY);

        /**
         * Migrate Administrator user
         */
        if (
            !(await userRepository.findOne({
                where: {
                    username: configs.administrator.username
                }
            }))
        ) {
            await userRepository.create(configs.administrator);
        }
    };

    const migrateRoles = async (ctx: Context) => {
        const roleRepository = ctx.getSync(ACLBindings.ROLE_REPOSITORY);

        /**
         * Migrate Users role
         */
        if (
            !(await roleRepository.findOne({
                where: {
                    name: "Users"
                }
            }))
        ) {
            await roleRepository.create(
                new Role({
                    name: "Users",
                    description: "System users"
                })
            );
        }

        /**
         * Migrate Admins role
         */
        if (
            !(await roleRepository.findOne({
                where: {
                    name: "Admins"
                }
            }))
        ) {
            await roleRepository.create(
                new Role({
                    name: "Admins",
                    description: "System admins"
                })
            );
        }
    };

    const migrateUsersRoles = async (ctx: Context, configs: ACLMixinConfig) => {
        const userRepository = ctx.getSync(ACLBindings.USER_REPOSITORY);
        const roleRepository = ctx.getSync(ACLBindings.ROLE_REPOSITORY);
        const userRoleRepository = ctx.getSync(
            ACLBindings.USER_ROLE_REPOSITORY
        );

        /**
         * Get Administrator user
         */
        const administratorUser = await userRepository.findOne({
            where: {
                username: configs.administrator.username
            }
        });

        /**
         * Get Admins role
         */
        const adminsRole = await roleRepository.findOne({
            where: {
                name: "Admins"
            }
        });

        if (administratorUser && adminsRole) {
            /**
             * Add Administrator to Admins
             */
            if (
                !(await userRoleRepository.findOne({
                    where: {
                        userId: administratorUser.id,
                        roleId: adminsRole.id
                    }
                }))
            ) {
                await userRoleRepository.create(
                    new UserRole({
                        userId: administratorUser.id,
                        roleId: adminsRole.id
                    })
                );
            }
        }
    };

    const migrateRolesPermissions = async (ctx: Context) => {
        const roleRepository = ctx.getSync(ACLBindings.ROLE_REPOSITORY);
        const permissionRepository = ctx.getSync(
            ACLBindings.PERMISSION_REPOSITORY
        );
        const rolePermissionRepository = ctx.getSync(
            ACLBindings.ROLE_PERMISSION_REPOSITORY
        );

        /**
         * Get Admins role
         */
        const adminsRole = await roleRepository.findOne({
            where: {
                name: "Admins"
            }
        });

        /**
         * Get All permissions
         */
        const permissions = await permissionRepository.find();

        if (adminsRole) {
            /**
             * Add permissions to Admins
             */
            const rolePermissions = await rolePermissionRepository.find({
                where: {
                    roleId: adminsRole.id
                }
            });

            const notAddedPermissions = permissions.filter(
                permission =>
                    rolePermissions
                        .map(rolePermission => rolePermission.permissionId)
                        .filter(permissionId => permissionId === permission.id)
                        .length === 0
            );

            await rolePermissionRepository.createAll(
                notAddedPermissions.map(
                    permission =>
                        new RolePermission({
                            roleId: adminsRole.id,
                            permissionId: permission.id
                        })
                )
            );
        }
    };

    return class extends superClass {
        public aclConfigs: ACLMixinConfig = {
            administrator: new User({
                username: "administrator",
                password: "administrator",
                email: "admin@admin.com",
                firstName: "System",
                lastName: "Administrator",
                status: "Active"
            }),
            sessionTimeout: 300e3
        };

        async boot() {
            bootObservers(this as any);

            await super.boot();

            bootModels(this as any, this.aclConfigs);
            bootProviders(this as any, this.aclConfigs);
            bootConstants(this as any, this.aclConfigs);
            bootDataSources(this as any);
            bootRepositories(this as any);
        }

        async migrateSchema(options?: SchemaMigrationOptions) {
            await super.migrateSchema(options);

            await migrateUsers(this as any, this.aclConfigs);
            await migrateRoles(this as any);
            await migrateUsersRoles(this as any, this.aclConfigs);
            await migrateRolesPermissions(this as any);
        }
    };
}
