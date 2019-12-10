import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";

import { FilterMethod } from "~/types";

export const filter = (
    inputArg: number,
    inputFilter: "where" | "filter" | string,
    filterMethod: FilterMethod<any>,
    outputArg: number,
    outputFilter: "where" | "filter",
    andId?: {
        arg: number | ((context: InvocationContext) => string);
        property: string;
    }
): Interceptor => {
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
        filter = filterMethod(invocationCtx, filter);

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
};
