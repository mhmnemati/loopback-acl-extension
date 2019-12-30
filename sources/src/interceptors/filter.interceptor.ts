import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";

import { RepositoryGetter } from "../types";
import { ACLController } from "../servers";

export function filter<Controller extends ACLController>(
    repositoryGetter: RepositoryGetter<Controller, any>,
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
        /** Get repository */
        const repository = repositoryGetter(invocationCtx.target as any);

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
        // filter = filterMethod(invocationCtx, filter);
        // TODO: filter, inclusion

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
