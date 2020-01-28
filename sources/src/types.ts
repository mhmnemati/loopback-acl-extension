import {
    Entity,
    DefaultCrudRepository,
    Where,
    Class
} from "@loopback/repository";
import { PermissionsList, Condition } from "loopback-authorization-extension";
import { InvocationContext, Provider } from "@loopback/context";
import { Ctor } from "loopback-history-extension";

import { ApplicationConfig } from "@loopback/core";
import { RestServerConfig } from "@loopback/rest";
import { HttpServerOptions } from "@loopback/http-server";

import { BearerTokenService } from "./providers";

import { User, Session, Code } from "./models";

/**
 * Default Permissions
 */
export class ACLPermissions extends PermissionsList {
    /** User */
    USERS_READ = "Read users";
    USERS_WRITE = "Write users";
    USERS_HISTORY = "Read users history";

    /** Self user */
    USERS_READ_SELF = "Read self user";
    USERS_WRITE_SELF = "Write self user";
    USERS_HISTORY_SELF = "Read self user history";

    /** Role */
    ROLES_READ = "Read roles";
    ROLES_WRITE = "Write roles";
    ROLES_HISTORY = "Read roles history";

    /** Permissions */
    PERMISSIONS_READ = "Read permissions";
    PERMISSIONS_WRITE = "Write permissions";

    /** UserRoles */
    USER_ROLES_READ = "Read userRoles";
    USER_ROLES_WRITE = "Write userRoles";
    USER_ROLES_HISTORY = "Read userRoles history";

    /** RolePermissions */
    ROLE_PERMISSIONS_READ = "Read rolePermissions";
    ROLE_PERMISSIONS_WRITE = "Write rolePermissions";
    ROLE_PERMISSIONS_HISTORY = "Read rolePermissions history";
}

/** Get Repository From Controller */
export type RepositoryGetter<Model extends Entity, Controller> = (
    controller: Controller
) => DefaultCrudRepository<Model, any, any>;

/** Filter Where, filters a Where */
export type FilterWhere<Model extends Entity> = (
    context: InvocationContext,
    where: Where<Model>
) => Promise<Where<Model>>;

/** Filter Access, tuple of permission condition and filter where */
export type FilterAccess<
    Model extends Entity,
    Permissions extends ACLPermissions
> = [Condition<Permissions>, FilterWhere<Model>];

/** Filter Scope, passed to filter interceptor for API's business scope definition */
export interface FilterScope<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
> {
    ctor: Ctor<Model>;
    ctorId: keyof Model;
    repositoryGetter: RepositoryGetter<Model, Controller>;

    create?: FilterAccess<Model, Permissions>;
    read?: FilterAccess<Model, Permissions>;
    update?: FilterAccess<Model, Permissions>;
    delete?: FilterAccess<Model, Permissions>;
    history?: FilterAccess<Model, Permissions>;

    include: {
        [relation: string]: FilterScope<Model, Permissions, Controller>;
    };
}

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
export interface ACLMixinConfig<Permissions extends ACLPermissions> {
    sessionModel?: Ctor<Session>;
    codeModel?: Ctor<Code>;
    tokenProvider?: Class<BearerTokenService>;
    messageProvider?: Class<Provider<MessageHandler>>;
    activateProvider?: Class<Provider<ActivateHandler>>;
    administrator: User;
    usersPermissions: (keyof Permissions)[];
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
