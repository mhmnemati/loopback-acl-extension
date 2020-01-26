import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Filter } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { authorizeFn } from "loopback-authorization-extension";

import { ACLPermissions } from "../types";

import { ACLController } from "../servers";

export function filter<Model extends Entity>(
    ctor: Ctor<Model>,
    access: "read" | "update" | "delete" | "history",
    inputArg: number,
    inputFilter: "where" | "filter" | string,
    outputArg: number,
    outputFilter: "where" | "filter",
    andId?: {
        arg: number | ((context: InvocationContext) => string);
        property: string;
    }
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        /** Read input argument */
        let filter = invocationCtx.args[inputArg] || {};

        /** Change input filter */
        if (inputFilter === "where") {
            filter = {
                where: filter
            };
        } else if (inputFilter === "filter") {
            filter = {
                ...filter,
                where: filter.where || {}
            };
        } else {
            filter = {
                where: {
                    [inputFilter]: filter
                }
            };
        }

        /** Apply filter */
        filter = await filterApply<Model>(ctor, access, invocationCtx, filter);

        /** Apply optional id and */
        if (andId) {
            if (typeof andId.arg === "number") {
                filter.where = {
                    and: [
                        { [andId.property]: invocationCtx.args[andId.arg] },
                        filter.where
                    ]
                };
            } else {
                filter.where = {
                    and: [
                        { [andId.property]: andId.arg(invocationCtx) },
                        filter.where
                    ]
                };
            }
        }

        /** Change output filter */
        if (outputFilter === "where") {
            filter = filter.where;
        }

        /** Write output argument */
        invocationCtx.args[outputArg] = filter;

        return next();
    };
}

async function filterApply<Model extends Entity>(
    ctor: Ctor<Model>,
    access: "read" | "update" | "delete" | "history",
    invocationCtx: InvocationContext,
    filter: Filter<Model>
): Promise<Filter<Model>> {
    // filter = await getAccessFilter<Model>(ctor, access)(invocationCtx, filter);

    // if (filter.include) {
    //     filter.include = (await Promise.all(
    //         filter.include.map(async inclusion => {
    //             const inclusionRelation = inclusion.relation;
    //             const inclusionTarget = getAccessTarget<Model>(
    //                 ctor,
    //                 inclusionRelation
    //             );
    //             const inclusionPermission = getAccessPermission<
    //                 any,
    //                 ACLPermissions
    //             >(ctor, access);
    //             const inclusionFilter = getFilter<any>(inclusion.scope);

    //             /** Check related model is accessable using current model */
    //             if (!inclusionTarget) {
    //                 return undefined;
    //             }

    //             /** Check user has access permission to related model */
    //             if (
    //                 !(await authorizeFn<any>(
    //                     inclusionPermission,
    //                     (invocationCtx.target as ACLController).session
    //                         .permissions,
    //                     invocationCtx
    //                 ))
    //             ) {
    //                 return undefined;
    //             }

    //             /** Apply filter over inclusion filter */
    //             inclusion.scope = await filterApply<Model>(
    //                 inclusionTarget,
    //                 access,
    //                 invocationCtx,
    //                 inclusionFilter
    //             );

    //             return inclusion;
    //         })
    //     )) as any[];

    //     filter.include = filter.include.filter(inclusion => Boolean(inclusion));
    // }

    return filter;
}

function getFilter<Model extends Entity>(
    filter?: Filter<Model>
): Filter<Model> {
    if (filter && filter.where) {
        return filter;
    }

    return {
        where: {},
        ...filter
    };
}
