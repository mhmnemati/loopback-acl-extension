import { Context, BindingKey, bind } from "@loopback/context";
import { Ctor } from "loopback-history-extension";
import { juggler } from "@loopback/repository";

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
} from "./models";
import {
    UserRepository,
    GroupRepository,
    RoleRepository,
    PermissionRepository,
    SessionRepository,
    CodeRepository
} from "./repositories";

import {
    UserGroupRepository,
    UserRoleRepository,
    GroupRoleRepository,
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
     * 2. GroupModel
     * 3. RoleModel
     * 4. PermissionModel
     *
     * 5. SessionModel
     * 6. CodeModel
     */
    export const USER_MODEL = BindingKey.create<Ctor<User>>(
        "private.acl.models.user"
    );
    export const GROUP_MODEL = BindingKey.create<Ctor<Group>>(
        "private.acl.models.group"
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
    export const DATASOURCE_RELATIONAL = BindingKey.create<juggler.DataSource>(
        "private.acl.dataSources.relational"
    );
    export const DATASOURCE_CACHE = BindingKey.create<juggler.DataSource>(
        "private.acl.dataSources.cache"
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
     * 2. GroupRepository
     * 3. RoleRepository
     * 4. PermissionRepository
     *
     * 5. SessionRepository
     * 6. CodeRepository
     */
    export const USER_REPOSITORY = BindingKey.create<
        UserRepository<User, UserRelations>
    >("acl.repositories.user");
    export const GROUP_REPOSITORY = BindingKey.create<
        GroupRepository<Group, GroupRelations>
    >("acl.repositories.group");
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
     * Relation Repository key:
     *
     * 1. UserGroupRepository
     * 2. UserRoleRepository
     * 3. GroupRoleRepository
     * 4. RolePermissionRepository
     */
    export const USER_GROUP_REPOSITORY = BindingKey.create<UserGroupRepository>(
        "acl.repositories.userGroup"
    );
    export const USER_ROLE_REPOSITORY = BindingKey.create<UserRoleRepository>(
        "acl.repositories.userRole"
    );
    export const GROUP_ROLE_REPOSITORY = BindingKey.create<GroupRoleRepository>(
        "acl.repositories.groupRole"
    );
    export const ROLE_PERMISSION_REPOSITORY = BindingKey.create<
        RolePermissionRepository
    >("acl.repositories.rolePermission");

    //   export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    //     "authentication.bearer.tokenService"
    //   );
}

/**
 * Binding, Finding key
 *
 * 1. DataSourceRelational
 * 2. DataSourceCache
 *
 * 3. UserRepository
 * 4. GroupRepository
 * 5. RoleRepository
 * 6. PermissionRepository
 *
 * 7. SessionRepository
 * 8. CodeRepository
 */
export type BindACLKey =
    | "DataSourceRelational"
    | "DataSourceCache"
    | "UserRepository"
    | "GroupRepository"
    | "RoleRepository"
    | "PermissionRepository"
    | "SessionRepository"
    | "CodeRepository";
export function bindAuthorization(key: BindACLKey) {
    return bind(binding => {
        binding.tag({
            acl: true,
            aclKey: key
        });

        return binding;
    });
}
export function findAuthorization(ctx: Context, key: BindACLKey) {
    const binding = ctx.findByTag({
        acl: true,
        aclKey: key
    })[0];

    if (binding) {
        return binding.getValue(ctx);
    }
}
