import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Where, Filter } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { authorizeFn } from "loopback-authorization-extension";

import { ACLPermissions, FilterScope } from "../types";

import { ACLController } from "../servers";

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
