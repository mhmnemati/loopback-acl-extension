import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";

import { RepositoryGetter } from "../types";
import { ACLController } from "../servers";

export function exist<Controller extends ACLController>(
    argIndex: number,
    repositoryGetter: RepositoryGetter<Controller, any>
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
