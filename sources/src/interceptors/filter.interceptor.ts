import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Filter, RelationType, hasMany } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { authorizeFn } from "loopback-authorization-extension";

import { ACLPermissions, FilterScope } from "../types";

import { ACLController } from "../servers";

export interface Path<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
> {
    ctor: Ctor<Model>;
    scope: FilterScope<Model, Permissions, Controller>;
    relation?: {
        name: string;
        type: RelationType;
    };
}

export function filter<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    path: Path<Model, Permissions, Controller>,
    access: "read" | "update" | "delete" | "history",
    argsIndexStart: number,
    argsIndexLength: number,

    argIndex: number,
    argType: "",

    argTypes: string | { type: "where" | "filter" } | undefined[],
    outType: "where" | "filter"
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        // TODO: generate filter from argTypes, invocationCtx.args
        let filter = null as any;

        // find(filterFn(generateFilter(id1, id2, ..., idN)), "read") => idN | idN+1 | idN+2 | ...
        // filter.where = filterFn({and: [{id: idN+1}, filter.where]})

        let result: any = await filterFn(path, access, filter, invocationCtx);

        if (outType === "where") {
            result = result.where;
        }

        invocationCtx.args.push(result);

        return next();
    };
}

export async function filterFn<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    path: Path<Model, Permissions, Controller>,
    access: "read" | "update" | "delete" | "history",
    filter: Filter<Model> | undefined,
    invocationCtx: InvocationContext
): Promise<Filter<Model>> {
    filter = filter || {};
    filter.where = filter.where || {};

    /** Apply filter on `where` by scope and access */
    const filterAccess = path.scope[access];

    if (filterAccess) {
        const filterMethod = filterAccess[1];

        filter.where = await filterMethod(invocationCtx, filter.where);
    } else {
        return {
            where: { [getIdPropertyByPath(path)]: null }
        } as any;
    }

    /** Apply filter on `include` by scope and filter */
    if (filter.include) {
        /** Remove inclusions that not exist in `model` or `scope` relations */
        filter.include = filter.include.filter(
            inclusion =>
                inclusion.relation in path.ctor.definition.relations &&
                inclusion.relation in path.scope.include
        );

        /**
         * Remove inclusions that hasn't access permission
         * Remove undefined inclusions
         * */
        filter.include = (
            await Promise.all(
                filter.include.map(async inclusion => {
                    const filterAccess =
                        path.scope.include[inclusion.relation][access];

                    if (filterAccess) {
                        const filterCondition = filterAccess[0];

                        if (
                            await authorizeFn<any>(
                                filterCondition,
                                (invocationCtx.target as ACLController).session
                                    .permissions,
                                invocationCtx
                            )
                        ) {
                            return inclusion;
                        }
                    }

                    return undefined;
                })
            )
        ).filter(inclusion => Boolean(inclusion)) as any[];

        /** Filter inclusion scope (Filter), recursively */
        filter.include = await Promise.all(
            filter.include.map(async inclusion => {
                inclusion.scope = await filterFn<any, Permissions, Controller>(
                    {
                        ctor: path.ctor.definition.relations[
                            inclusion.relation
                        ].target(),
                        scope: path.scope.include[inclusion.relation]
                    },
                    access,
                    inclusion.scope,
                    invocationCtx
                );

                return inclusion;
            })
        );
    }

    return filter;
}

/**
 * Getting id from path using ctor or relation: ctorName_id
 */
function getIdNameByPath<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(path?: Path<Model, Permissions, Controller>) {
    if (path) {
        if (path.relation) {
            if (path.relation.type === RelationType.hasMany) {
                return `${path.relation.name
                    .replace(/s$/, "")
                    .toLowerCase()}_id`;
            }
        } else {
            return `${path.ctor.name.toLowerCase()}_id`;
        }
    }

    return undefined;
}

/**
 * Getting id property from path using ctor: ctor.getIdProperties()[0]
 */
function getIdPropertyByPath<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(path: Path<Model, Permissions, Controller>) {
    if (!("id" in path.ctor.definition.properties)) {
        return path.ctor.getIdProperties()[0];
    }

    return "id";
}

/**
 * Getting name from path using ctor or relation: ctors
 */
function getPathNameByPath<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(path: Path<Model, Permissions, Controller>) {
    if (path.relation) {
        return `${path.relation.name.toLowerCase()}`;
    } else {
        return `${path.ctor.name.toLowerCase()}s`;
    }
}

/**
 * Generator example:
 *
 * [
 *  User        -   ()          -   ()          =>  /users
 *  UserRole    -   (userRoles) -   (hasMany)   =>  /{user_id}/userroles
 *  Role        -   (role)      -   (belongsTo) =>  /{userrole_id}/role
 *  RolePerm    -   (rolePerms) -   (hasMany)   =>  /rolepermissions
 *  Permission  -   (permissio) -   (belongsTo) =>  /{roleperm_id}/permission
 *  Key         -   (key)       -   (hasOne)    =>  /key
 *  Data        -   (datas)     -   (hasMany)   =>  /datas
 *  ...
 * ].reduce()
 *
 * if (previousPath && (
 *      !previousPath.relation ||
 *      previousPath.relation.type === hasMany
 * )) {
 *      /{model_id}
 * }
 *
 * if (!path.relation || path.relation.type === hasMany) {
 *      /model{s}
 * } else {
 *      /model
 * }
 */
export function getIds<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[]) {
    return paths
        .map((path, index) => getIdNameByPath(paths[index - 1]))
        .filter(id => Boolean(id));
}

export function getPath<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[], basePath: string) {
    return paths.reduce((accumulate, path, index) => {
        const idName = getIdNameByPath(paths[index - 1]);
        const pathName = getPathNameByPath(path);

        if (idName) {
            return `${accumulate}/{${idName}}/${pathName}`;
        } else {
            return `${accumulate}/${pathName}`;
        }
    }, basePath);
}

export function getFilter<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[], ids: string[]) {
    let filter: Filter<Model> = {};

    let idIndex = 0;
    paths.reduce((accumulate, path, index) => {
        const idName = getIdNameByPath(path);
        const idProperty = getIdPropertyByPath(path);

        /**
         * If last path relation is () or (hasMany) don't use it,
         * we want parent related id
         *
         * If last path is (belongsTo) or (hasOne) use it,
         * we want model id
         * */
        if (index === paths.length - 1 && idName) {
            return accumulate;
        }

        if (idName) {
            accumulate.include = [
                {
                    relation: path.relation?.name || "",
                    scope: {
                        where: {
                            [idProperty]: ids[idIndex++] || ""
                        }
                    }
                }
            ];
        } else {
            accumulate.include = [
                {
                    relation: path.relation?.name || "",
                    scope: {}
                }
            ];
        }

        return accumulate.include[0].scope as any;
    }, filter);

    if (filter.include) {
        return filter.include[0].scope;
    }
}
