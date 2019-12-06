import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { RepositoryGetter } from "~/types";

import { ACLController } from "~/servers";

export function unique<Model extends Entity>(
    repositoryGetter: RepositoryGetter<any>,
    ctor: Ctor<Model>,
    argIndex: number
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        /** Get repository */
        const repository = await repositoryGetter(
            invocationCtx.target as ACLController
        );

        /** Get model from arguments by arg index number */
        const model = invocationCtx.args[argIndex];

        /** Find unique fields of model ctor */
        const uniqueFields = Object.entries(ctor.definition.properties)
            .filter(([key, value]) => value.unique)
            .map(([key, value]) => key);

        /** Find unique fields that has a value in current model */
        const valueUniqueFields = uniqueFields.filter(key =>
            Boolean(model[key])
        );

        /** Find count of models where unique field values are same */
        const count = await repository.count({
            or: valueUniqueFields.map(fieldName => ({
                [fieldName]: model[fieldName]
            }))
        });

        if (count.count > 0) {
            throw {
                name: "DatabaseError",
                status: 409,
                message: `Conflict with unique fields: ${uniqueFields}`
            };
        }

        return next();
    };
}
