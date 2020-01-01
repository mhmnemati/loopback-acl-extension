import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { RepositoryGetter } from "../types";
import { ACLController } from "../servers";

export function unique<Controller extends ACLController, Model extends Entity>(
    ctor: Ctor<Model>,
    argIndex: number,
    argType: "single" | "multi",
    repositoryGetter: RepositoryGetter<Controller, any>
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        /** Get repository */
        const repository = repositoryGetter(invocationCtx.target as any);

        /** Get models from arguments by arg index number */
        let models: any[] = invocationCtx.args[argIndex];
        if (argType === "single") {
            models = [models];
        }

        /** Find unique fields of model ctor */
        const uniqueFields = Object.entries(ctor.definition.properties)
            .filter(([key, value]) => value.unique)
            .map(([key, value]) => key);

        /** Find count of models where unique field values are same */
        const count = await repository.count({
            or: uniqueFields.map(fieldName => ({
                [fieldName]: {
                    inq: models
                        .map(model => model[fieldName])
                        .filter(fieldValue => Boolean(fieldValue))
                }
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
