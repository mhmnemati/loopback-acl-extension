import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

export function valid<Model extends Entity>(
    ctor: Ctor<Model>,
    argIndex: number,
    argType: "single" | "multiple",
    partial: boolean
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        const isExists = await repositoryGetter(
            invocationCtx.target as any
        ).exists(invocationCtx.args[argIndex]);

        if (!isExists) {
            throw {
                name: "DatabaseError",
                status: 404,
                message: `Not Found Resource`
            };
        }

        return next();
    };
}
