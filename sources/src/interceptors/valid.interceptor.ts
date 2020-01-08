import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { HttpErrors } from "@loopback/rest";
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
