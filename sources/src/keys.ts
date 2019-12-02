import { Context, BindingKey, bind } from "@loopback/context";
import { Ctor } from "loopback-history-extension";
import { juggler } from "@loopback/repository";

import { User, Group, Role, Permission } from "./models";
import {
    UserRepository,
    GroupRepository,
    RoleRepository,
    PermissionRepository
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
     */
    export const USER_REPOSITORY = BindingKey.create<UserRepository>(
        "acl.repositories.user"
    );
    export const GROUP_REPOSITORY = BindingKey.create<GroupRepository>(
        "acl.repositories.group"
    );
    export const ROLE_REPOSITORY = BindingKey.create<RoleRepository>(
        "acl.repositories.role"
    );
    export const PERMISSION_REPOSITORY = BindingKey.create<
        PermissionRepository
    >("acl.repositories.permission");

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
 */
export type BindACLKey =
    | "DataSourceRelational"
    | "DataSourceCache"
    | "UserRepository"
    | "GroupRepository"
    | "RoleRepository"
    | "PermissionRepository";
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
