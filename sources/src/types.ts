import {
    Entity,
    DefaultCrudRepository,
    Filter,
    Class
} from "@loopback/repository";
import { PermissionsList } from "loopback-authorization-extension";
import { InvocationContext, Provider } from "@loopback/context";
import { Ctor } from "loopback-history-extension";

import { ApplicationConfig } from "@loopback/core";
import { RestServerConfig } from "@loopback/rest";
import { HttpServerOptions } from "@loopback/http-server";

import { BearerTokenService } from "./providers";

import { ACLController } from "./servers";

import {
    User,
    Role,
    Permission,
    UserRole,
    RolePermission,
    Session,
    Code
} from "./models";

/**
 * Default Permissions
 */
export class ACLPermissions extends PermissionsList {
    /** Users */
    USERS_READ = "Read users";
    USERS_WRITE = "Write users";
    USERS_HISTORY = "Read users history";

    /** Self user */
    USERS_READ_SELF = "Read self user";
    USERS_WRITE_SELF = "Write self user";
    USERS_HISTORY_SELF = "Read self user history";

    /** Roles */
    ROLES_READ = "Read roles";
    ROLES_WRITE = "Write roles";
    ROLES_HISTORY = "Read roles history";

    /** Roles - Users */
    ROLES_ADD_USER = "Add any user to any role";
    ROLES_REMOVE_USER = "Add any user to any role";

    /** Roles - Permissions */
    ROLES_ADD_PERMISSION = "Add any permission to any role";
    ROLES_REMOVE_PERMISSION = "Add any permission to any role";

    /** Permissions */
    PERMISSIONS_READ = "Read permissions";
    PERMISSIONS_WRITE = "Write permissions";
}

/** Get Repository From Controller */
export type RepositoryGetter<
    Controller extends ACLController,
    Model extends Entity
> = (controller: Controller) => DefaultCrudRepository<Model, any, any>;

/** Filter Handler */
export type FilterMethod<Model extends Entity> = (
    context: InvocationContext,
    filter: Filter<Model>
) => Filter<Model>;

/**
 * MessageProvider configs
 */
export type MessageHandler = (
    userId: string,
    code: string,
    type: "Account" | "Password"
) => Promise<void>;

/**
 * ActivateProvider configs
 */
export type ActivateHandler = (userId: string) => Promise<void>;

/**
 * ACLMixin configs
 */
export interface ACLMixinConfig {
    permissions?: Class<ACLPermissions>;
    userModel?: Ctor<User>;
    roleModel?: Ctor<Role>;
    permissionModel?: Ctor<Permission>;
    userRoleModel?: Ctor<UserRole>;
    rolePermissionModel?: Ctor<RolePermission>;
    sessionModel?: Ctor<Session>;
    codeModel?: Ctor<Code>;
    tokenProvider?: Class<BearerTokenService>;
    messageProvider?: Class<Provider<MessageHandler>>;
    activateProvider?: Class<Provider<ActivateHandler>>;
    administrator: User;
    sessionTimeout: number;
}

/**
 * ACLApplication configs
 */
export type ACLRestServerConfig = RestServerConfig & { homePath?: string };
export type ACLGraphQLServerConfig = HttpServerOptions;
export interface ACLApplicationConfig extends ApplicationConfig {
    rest?: ACLRestServerConfig;
    graphql?: ACLGraphQLServerConfig;
}
