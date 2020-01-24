import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { HttpErrors, requestBody } from "@loopback/rest";
import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLController } from "../servers";

export function validate<Model extends Entity>(
    ctor: Ctor<Model>,
    argIndex: number,
    argType: "single" | "multiple",
    partial: boolean
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        const controller = invocationCtx.target as ACLController;

        if (argType === "single") {
            if (!Boolean(invocationCtx.args[argIndex])) {
                throw new HttpErrors.UnprocessableEntity("Entity is not valid");
            }
        } else {
            invocationCtx.args[argIndex].forEach((item: any) => {
                if (!Boolean(item)) {
                    throw new HttpErrors.UnprocessableEntity(
                        "Entity is not valid"
                    );
                }
            });
        }

        return next();
    };
}
