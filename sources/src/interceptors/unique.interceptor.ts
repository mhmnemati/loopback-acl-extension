import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { HttpErrors } from "@loopback/rest";
import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { RepositoryGetter } from "../types";

export function unique<Model extends Entity, Controller>(
    ctor: Ctor<Model>,
    argIndex: number,
    argType: "single" | "multiple",
    withoutUnqiue: boolean,
    repositoryGetter: RepositoryGetter<any, Controller>
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
            .filter(([key, value]) =>
                Boolean(value.unique || (value.index && value.index.unique))
            )
            .map(([key, value]) => key);

        /** Find unique fields with at least one property in models */
        const uniqueFieldsWithProperties = uniqueFields.filter(
            fieldName =>
                models
                    .map(model => model[fieldName])
                    .filter(uniqueProperty => Boolean(uniqueProperty)).length >
                0
        );

        let count = { count: 0 };

        /** Check for without unique, when using updateAll */
        if (withoutUnqiue) {
            /** Find count of models unique fields */
            count = {
                count: models
                    .map(
                        model =>
                            Object.keys(model).filter(
                                modelKey =>
                                    uniqueFieldsWithProperties.indexOf(
                                        modelKey
                                    ) >= 0
                            ).length
                    )
                    .reduce((prev, current) => prev + current, 0)
            };
        } else if (uniqueFieldsWithProperties.length > 0) {
            /** Find count of models where unique field values are same */
            count = await repository.count({
                or: uniqueFieldsWithProperties.map(fieldName => ({
                    [fieldName]: {
                        inq: models
                            .map(model => model[fieldName])
                            .filter(fieldValue => Boolean(fieldValue))
                    }
                }))
            });
        }

        if (count.count > 0) {
            throw new HttpErrors.Conflict(
                `Conflict with unique fields: ${uniqueFields}`
            );
        }

        return next();
    };
}
