import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Filter } from "@loopback/repository";

export type FilterMethod<Model extends Entity> = (
    context: InvocationContext,
    filter: Filter<Model>
) => Filter<Model>;

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
