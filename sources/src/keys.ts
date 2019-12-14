import { Context, BindingKey, bind } from "@loopback/context";
import { Ctor } from "loopback-history-extension";
import { juggler } from "@loopback/repository";
import { CoreBindings } from "@loopback/core";

import { TokenService } from "@loopback/authentication";

import {
    User,
    UserRelations,
    Role,
    RoleRelations,
    Permission,
    PermissionRelations,
    Session,
    Code
} from "./models";
import {
    UserRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "./repositories";

import {
    UserRoleRepository,
    RolePermissionRepository
} from "loopback-authorization-extension";

/**
 * Private binding used in component scope
 */
export namespace PrivateACLBindings {
    /**
     * Model key:
     *
     * 1. UserModel
     * 2. RoleModel
     * 3. PermissionModel
     *
     * 4. SessionModel
     * 5. CodeModel
     */
    export const USER_MODEL = BindingKey.create<Ctor<User>>(
        "private.acl.models.user"
    );
    export const ROLE_MODEL = BindingKey.create<Ctor<Role>>(
        "private.acl.models.role"
    );
    export const PERMISSION_MODEL = BindingKey.create<Ctor<Permission>>(
        "private.acl.models.permission"
    );

    export const SESSION_MODEL = BindingKey.create<Ctor<Session>>(
        "private.acl.models.session"
    );
    export const CODE_MODEL = BindingKey.create<Ctor<Code>>(
        "private.acl.models.code"
    );

    /**
     * DataSource key
     *
     * 1. DataSourceRelational: RDBMS
     * 2. DataSourceCache: CDBMS
     */
    export const RELATIONAL_DATASOURCE = BindingKey.create<juggler.DataSource>(
        "private.acl.dataSources.relational"
    );
    export const CACHE_DATASOURCE = BindingKey.create<juggler.DataSource>(
        "private.acl.dataSources.cache"
    );

    /**
     * Provider key
     *
     * 1. TokenProvider
     */
    export const TOKEN_PROVIDER = BindingKey.create<TokenService>(
        "private.acl.providers.token"
    );
}

/**
 * Public bindings used in application scope
 */
export namespace ACLBindings {
    /**
     * Base Repository key:
     *
     * 1. UserRepository
     * 2. RoleRepository
     * 3. PermissionRepository
     *
     * 4. SessionRepository
     * 5. CodeRepository
     */
    export const USER_REPOSITORY = BindingKey.create<
        UserRepository<User, UserRelations>
    >("acl.repositories.user");
    export const ROLE_REPOSITORY = BindingKey.create<
        RoleRepository<Role, RoleRelations>
    >("acl.repositories.role");
    export const PERMISSION_REPOSITORY = BindingKey.create<
        PermissionRepository<Permission, PermissionRelations>
    >("acl.repositories.permission");

    export const SESSION_REPOSITORY = BindingKey.create<
        SessionRepository<Session>
    >("acl.repositories.session");
    export const CODE_REPOSITORY = BindingKey.create<CodeRepository<Code>>(
        "acl.repositories.code"
    );

    /**
     * Server Config key:
     *
     * 1. RestServerConfig
     * 2. GraphQLServerConfig
     */
    export const REST_SERVER_CONFIG = CoreBindings.APPLICATION_CONFIG.deepProperty(
        "rest"
    );
    export const GRAPHQL_SERVER_CONFIG = CoreBindings.APPLICATION_CONFIG.deepProperty(
        "graphql"
    );
}

/**
 * Binding, Finding key
 *
 * 1. DataSourceRelational
 * 2. DataSourceCache
 *
 * 3. TokenProvider
 *
 * 4. UserRepository
 * 5. RoleRepository
 * 6. PermissionRepository
 *
 * 7. SessionRepository
 * 8. CodeRepository
 */
export type BindACLKey =
    | "RelationalDataSource"
    | "CacheDataSource"
    | "TokenProvider"
    | "UserRepository"
    | "RoleRepository"
    | "PermissionRepository"
    | "SessionRepository"
    | "CodeRepository";
export function bindACL(key: BindACLKey) {
    return bind(binding => {
        binding.tag({
            acl: true,
            aclKey: key
        });

        return binding;
    });
}
export function findACL(ctx: Context, key: BindACLKey) {
    const binding = ctx.findByTag({
        acl: true,
        aclKey: key
    })[0];

    if (binding) {
        return binding.getValue(ctx);
    }
}
