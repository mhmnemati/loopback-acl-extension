import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { HttpErrors } from "@loopback/rest";
import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

export function validate<Model extends Entity>(
    ctor: Ctor<Model>,
    argIndex: number
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        /** Get model from arguments request body */
        const model = invocationCtx.args[argIndex];

        if (!(await validateFn(ctor, model, invocationCtx))) {
            throw new HttpErrors.UnprocessableEntity("Entity is not valid");
        }

        return next();
    };
}

export async function validateFn<Model extends Entity>(
    ctor: Ctor<Model>,
    model: Model,
    invocationCtx: InvocationContext
): Promise<boolean> {
    let result = true;

    if (Array.isArray(model)) {
        model.forEach((item: any) => {
            if (!Boolean(item)) {
                result = false;
            }
        });
    } else {
        if (!Boolean(model)) {
            result = false;
        }
    }

    return result;
}
