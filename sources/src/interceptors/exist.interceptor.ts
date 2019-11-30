import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { RepositoryGetter } from "@acl/types";

import { Controller } from "@acl/servers/rest/controller";

export const exist = (repositoryGetter: RepositoryGetter<any>): Interceptor => {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        const isExists = await repositoryGetter(
            invocationCtx.target as Controller
        ).exists(invocationCtx.args[0]);

        if (!isExists) {
            throw {
                name: "DatabaseError",
                status: 404,
                message: `Not Found Resource`
            };
        }

        return next();
    };
};
