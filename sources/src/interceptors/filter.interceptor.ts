import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Filter, Where } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { authorizeFn } from "loopback-authorization-extension";

import { ACLPermissions, FilterWhere, FilterScope } from "../types";

import { ACLController } from "../servers";

export async function filterFilter<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    ctor: Ctor<Model>,
    filter: Filter<Model>,
    scope: FilterScope<Model, Permissions, Controller>,
    access: "read" | "update" | "delete" | "history"
): Promise<Filter<Model>> {
    filter.where = await filterWhere(ctor, filter.where || {}, scope, access);

    if (filter.include) {
        filter.include = await Promise.all(
            filter.include
                .filter(inclusion => inclusion.relation in scope.include)
                .filter(
                    inclusion => inclusion.relation in ctor.definition.relations
                )
                // .filter(
                //     async inclusion =>
                //         await authorizeFn<any>(
                //             scope[access][],
                //             (invocationCtx.target as ACLController).session
                //                 .permissions,
                //             invocationCtx
                //         )
                // )
                .map(async inclusion => {
                    inclusion.scope = await filterFilter<
                        any,
                        Permissions,
                        Controller
                    >(
                        ctor.definition.relations[inclusion.relation].target(),
                        inclusion.scope || {},
                        scope.include[inclusion.relation],
                        access
                    );

                    return inclusion;
                })
        );
    }

    return filter;
}

export async function filterWhere<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    ctor: Ctor<Model>,
    where: Where<Model>,
    scope: FilterScope<Model, Permissions, Controller>,
    access: "read" | "update" | "delete" | "history"
): Promise<Where<Model>> {
    const filterAccess = scope[access];

    if (filterAccess) {
        const filterCondition = filterAccess[0];
        const filterMethod = filterAccess[1];

        if (await authorizeFn(filterCondition, [], null as any)) {
            return await filterMethod(null as any, where);
        }
    }

    return {
        id: null
    } as any;
}
