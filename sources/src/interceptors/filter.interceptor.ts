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
    ctor: Ctor<Model>,
    scope: FilterScope<Model, Permissions, Controller>,
    access: "read" | "update" | "delete" | "history",
    outputType: "where" | "filter",
    pathId?: number,
    modelId?: (controller: Controller) => string | number,
    modelFilter?: { index: number; type: "where" | "filter" }
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        const modelIdProperty = ctor.getIdProperties()[
            ctor.getIdProperties().length - 1
        ];

        let idWhere: Where<any> = {};

        /** Apply modelId filter */
        if (modelId) {
            if (typeof modelId === "number") {
                idWhere[modelIdProperty] = invocationCtx.args[modelId];
            } else {
                idWhere[modelIdProperty] = modelId(invocationCtx.target as any);
            }
        }

        /** Apply pathId filter */
        if (pathId) {
            const id = invocationCtx.args[pathId];

            if (Array.isArray(id.property)) {
                idWhere = {
                    and: [
                        idWhere,
                        {
                            or: id.property.map((idProperty: string) => ({
                                [idProperty]: id.value
                            }))
                        }
                    ]
                };
            } else if (id) {
                idWhere[id.property] = id.value;
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

        result = await filterFn(ctor, scope, access, result, invocationCtx);

        if (outputType === "where") {
            result = result.where as any;
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
    ctor: Ctor<Model>,
    scope: FilterScope<Model, Permissions, Controller>,
    access: "read" | "update" | "delete" | "history",
    filter: Filter<Model> = {},
    invocationCtx: InvocationContext
): Promise<Filter<Model>> {
    const modelAccess = scope[access];
    const modelIdProperty = ctor.getIdProperties()[
        ctor.getIdProperties().length - 1
    ];

    /** Check access object exists */
    if (!modelAccess) {
        return {
            where: { [modelIdProperty]: null }
        } as any;
    }

    /** Apply filter on `where` */
    filter.where = await modelAccess[1](invocationCtx, filter.where || {});

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
                    const modelAccess =
                        scope.include[inclusion.relation][access];

                    if (modelAccess) {
                        if (
                            await authorizeFn<any>(
                                modelAccess[0],
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
