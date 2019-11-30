import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { FilterMethod } from "@acl/types";

export const filter = (
    argIndex: number,
    inputFilter: "where" | "filter",
    outputFilter: "where" | "filter",
    filterMethod: FilterMethod<any>
): Interceptor => {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        if (inputFilter === "where") {
            invocationCtx.args[argIndex] = {
                where: invocationCtx.args[argIndex] || {}
            };
        } else {
            invocationCtx.args[argIndex] = invocationCtx.args[argIndex] || {};
        }

        invocationCtx.args[argIndex] = filterMethod(
            invocationCtx,
            invocationCtx.args[argIndex]
        );

        if (outputFilter === "where") {
            invocationCtx.args[argIndex] =
                invocationCtx.args[argIndex].where || {};
        }

        return next();
    };
};
