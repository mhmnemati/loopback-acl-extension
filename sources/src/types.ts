import {
    Entity,
    DefaultCrudRepository,
    Filter,
    Class
} from "@loopback/repository";
import { PermissionsList } from "loopback-authorization-extension";
import { InvocationContext } from "@loopback/context";
import { Ctor } from "loopback-history-extension";

import { ApplicationConfig } from "@loopback/core";
import { RestServerConfig } from "@loopback/rest";
import { HttpServerOptions } from "@loopback/http-server";

import { ACLController } from "~/servers";

import { User, Group, Role, Permission, Session, Code } from "~/models";

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

    /** Groups */
    GROUPS_READ = "Read groups";
    GROUPS_WRITE = "Write groups";
    GROUPS_HISTORY = "Read groups history";

    /** Groups - Users */
    GROUPS_ADD_USER = "Add any user to any group";
    GROUPS_REMOVE_USER = "Add any user to any group";

    /** Roles */
    ROLES_READ = "Read roles";
    ROLES_WRITE = "Write roles";
    ROLES_HISTORY = "Read roles history";

    /** Roles - Users */
    ROLES_ADD_USER = "Add any user to any role";
    ROLES_REMOVE_USER = "Add any user to any role";

    /** Roles - Groups */
    ROLES_ADD_GROUP = "Add any group to any role";
    ROLES_REMOVE_GROUP = "Add any group to any role";

    /** Roles - Permissions */
    ROLES_ADD_PERMISSION = "Add any permission to any role";
    ROLES_REMOVE_PERMISSION = "Add any permission to any role";

    /** Permissions */
    PERMISSIONS_READ = "Read permissions";
    PERMISSIONS_WRITE = "Write permissions";
}

/** Get Repository From Controller */
export type RepositoryGetter<Model extends Entity> = (
    controller: ACLController
) => DefaultCrudRepository<Model, any, any>;

/** Get Model Ctor From Controller */
export type ModelGetter<Model extends Entity> = (
    controller: ACLController
) => Ctor<Model>;

/** Filter Handler */
export type FilterMethod<Model extends Entity> = (
    context: InvocationContext,
    filter: Filter<Model>
) => Filter<Model>;

/**
 * ACLMixin configs
 */
export interface ACLMixinConfig {
    permissions?: Class<ACLPermissions>;
    userModel?: Ctor<User>;
    groupModel?: Ctor<Group>;
    roleModel?: Ctor<Role>;
    permissionModel?: Ctor<Permission>;
    sessionModel?: Ctor<Session>;
    codeModel?: Ctor<Code>;
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
