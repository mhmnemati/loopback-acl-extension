import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { DefaultCrudRepository, Entity } from "@loopback/repository";

import { DMSController } from "@dms/servers/rest/controller";

export type RepositoryGetter<Model extends Entity> = (
    controller: DMSController
) => DefaultCrudRepository<Model, any, any>;

export const exist = (repositoryGetter: RepositoryGetter<any>): Interceptor => {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        const isExists = await repositoryGetter(
            invocationCtx.target as DMSController
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
