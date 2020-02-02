import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Where, Filter, RelationType } from "@loopback/repository";
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
    paths: Path<Model, Permissions, Controller>[],
    access: "read" | "update" | "delete" | "history",
    outputType: "where" | "filter",
    pathIds?: { begin: number; end: number },
    modelId?: (controller: Controller) => string | number,
    modelFilter?: { index: number; type: "where" | "filter" }
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        let idWhere: Where<any> = {};

        /** Apply modelId filter */
        if (modelId) {
            if (typeof modelId === "number") {
                idWhere[getIdPropertyByPath(paths[paths.length - 1])] =
                    invocationCtx.args[modelId];
            } else {
                idWhere[getIdPropertyByPath(paths[paths.length - 1])] = modelId(
                    invocationCtx.target as any
                );
            }
        }

        /** Apply pathIds filter */
        if (pathIds && pathIds.end > pathIds.begin) {
            const idValue = await getPathIdValue(
                paths,
                invocationCtx.args.slice(pathIds.begin, pathIds.end),
                invocationCtx
            );

            const idProperty = getPathIdProperty(paths);

            if (Array.isArray(idProperty)) {
                idWhere = {
                    and: [
                        idWhere,
                        {
                            or: idProperty.map(idPropertyName => ({
                                [idPropertyName]: idValue
                            }))
                        }
                    ]
                };
            } else {
                idWhere[idProperty] = idValue;
            }
        }

        /** Get filter from modelFilter argument */
        let result: Filter<any> = {};
        if (modelFilter) {
            if (modelFilter.type === "where") {
                result.where = invocationCtx.args[modelFilter.index];
            } else {
                result = invocationCtx.args[modelFilter.index] || {};
            }
        }
        if (Boolean(result.where)) {
            result.where = { and: [idWhere, result.where] };
        } else {
            result.where = idWhere;
        }

        result = await filterFn(
            paths[paths.length - 1].ctor,
            paths[paths.length - 1].scope,
            access,
            result,
            invocationCtx
        );

        if (outputType === "where") {
            result = result.where as any;
        }

        invocationCtx.args.push(result);

        return next();
    };
}

async function filterFn<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    ctor: Ctor<Model>,
    scope: FilterScope<Model, Permissions, Controller>,
    access: "read" | "update" | "delete" | "history",
    filter: Filter<Model> | undefined,
    invocationCtx: InvocationContext
): Promise<Filter<Model>> {
    filter = filter || {};
    filter.where = filter.where || {};

    /** Apply filter on `where` by scope and access */
    const filterAccess = scope[access];

    if (filterAccess) {
        const filterMethod = filterAccess[1];

        filter.where = await filterMethod(invocationCtx, filter.where);
    } else {
        return {
            where: { [getIdPropertyByPath({ ctor: ctor, scope: scope })]: null }
        } as any;
    }

    /** Apply filter on `include` by scope and filter */
    if (filter.include) {
        /** Remove inclusions that not exist in `model` or `scope` relations */
        filter.include = filter.include.filter(
            inclusion =>
                inclusion.relation in ctor.definition.relations &&
                inclusion.relation in scope.include
        );

        /**
         * Remove inclusions that hasn't access permission
         * Remove undefined inclusions
         * */
        filter.include = (
            await Promise.all(
                filter.include.map(async inclusion => {
                    const filterAccess =
                        scope.include[inclusion.relation][access];

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
                    ctor.definition.relations[inclusion.relation].target(),
                    scope.include[inclusion.relation],
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
>(path?: Path<Model, Permissions, Controller>): string | undefined {
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
>(path: Path<Model, Permissions, Controller>): string {
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
>(path: Path<Model, Permissions, Controller>): string {
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
>(paths: Path<Model, Permissions, Controller>[]): string[] {
    return paths
        .map((path, index) => getIdNameByPath(paths[index - 1]))
        .filter(id => Boolean(id)) as any;
}

export function getPath<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[], basePath: string): string {
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

function getPathFilter<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    paths: Path<Model, Permissions, Controller>[],
    ids: string[]
): Filter<Model> | undefined {
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
        return filter.include[0].scope as any;
    }
}

async function getPathIdValue<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    paths: Path<Model, Permissions, Controller>[],
    ids: string[],
    invocationCtx: InvocationContext
): Promise<string | undefined> {
    const pathFilter = getPathFilter(paths, ids);

    if (!pathFilter) {
        return undefined;
    }

    const filter = await filterFn<any, Permissions, Controller>(
        paths[0].ctor,
        paths[0].scope,
        "read",
        pathFilter,
        invocationCtx
    );

    const model = await paths[0].scope
        .repositoryGetter(invocationCtx.target as any)
        .findOne(filter);

    return (
        paths.reduce((accumulate, path, index) => {
            if (!Boolean(accumulate)) {
                return undefined;
            }

            if (path.relation) {
                accumulate = accumulate[path.relation.name] || [];

                if (path.relation.type === RelationType.hasMany) {
                    accumulate = accumulate[0] || {};
                }
            }

            if (index === paths.length) {
                return accumulate[getIdPropertyByPath(path)];
            } else {
                return accumulate;
            }
        }, model) || ""
    );
}

function getPathIdProperty<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[]): string | string[] {
    const leafPath = paths[paths.length - 1];
    const nodePath = paths[paths.length - 2];

    if (leafPath.relation && leafPath.relation.type === RelationType.hasMany) {
        // find belongsTo relations related to paths[paths.length - 2]
        return Object.entries(leafPath.ctor.definition.relations)
            .filter(
                ([relation, target]) =>
                    target.target().name === nodePath.ctor.name
            )
            .map(([relation, target]) => relation);
    }

    return getIdPropertyByPath(leafPath);
}
