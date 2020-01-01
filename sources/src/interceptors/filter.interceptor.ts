import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Filter } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { getAccessFilter, getAccessTarget } from "../decorators";

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
        filter = filterApply<Model>(ctor, access, invocationCtx, filter);

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

function filterApply<Model extends Entity>(
    ctor: Ctor<Model>,
    access: "read" | "update" | "delete" | "history",
    invocationCtx: InvocationContext,
    filter: Filter<Model>
): Filter<Model> {
    filter = getAccessFilter<Model>(ctor, access)(invocationCtx, filter);

    if (filter.include) {
        for (
            let inclusionIndex = 0;
            inclusionIndex < filter.include.length;
            inclusionIndex++
        ) {
            const inclusionRelation = filter.include[inclusionIndex].relation;
            const inclusionFilter = getFilter<any>(
                filter.include[inclusionIndex].scope
            );
            const inclusionTarget = getAccessTarget<Model>(
                ctor,
                inclusionRelation
            );

            if (inclusionTarget) {
                filter.include[inclusionIndex].scope = filterApply<Model>(
                    inclusionTarget,
                    access,
                    invocationCtx,
                    inclusionFilter
                );
            }
        }
    }

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
