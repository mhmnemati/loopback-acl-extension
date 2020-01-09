import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, EntityNotFoundError } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { RepositoryGetter } from "../types";

export function exist<Model extends Entity, Controller>(
    ctor: Ctor<Model>,
    argIndex: number,
    repositoryGetter: RepositoryGetter<Controller, any>
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        const id = invocationCtx.args[argIndex];

        const isExists = await repositoryGetter(
            invocationCtx.target as any
        ).exists(id);

        if (!isExists) {
            throw new EntityNotFoundError(ctor, id);
        }

        return next();
    };
}
