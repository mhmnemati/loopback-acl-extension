import { Interceptor, InvocationContext } from "@loopback/context";
import { Entity, Filter, Where } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { authorizeFn } from "loopback-authorization-extension";

import { ACLPermissions, FilterScope } from "../types";

import { ACLController } from "../servers";

export async function filterFilter<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    ctor: Ctor<Model>,
    filter: Filter<Model> | undefined,
    scope: FilterScope<Model, Permissions, Controller>,
    access: "create" | "read" | "update" | "delete" | "history",
    invocationCtx: InvocationContext
): Promise<Filter<Model>> {
    filter = filter || {};

    const filterAccess = scope[access];
    if (!filterAccess) {
        return {
            where: { id: null }
        } as any;
    }

    /** Apply filter on where by scope and access */
    filter.where = await filterWhere(
        ctor,
        filter.where,
        scope,
        access,
        invocationCtx
    );

    if (filter.include) {
        /** Remove inclusions that not exist in `model` or `scope` relations */
        filter.include = filter.include.filter(
            inclusion =>
                inclusion.relation in ctor.definition.relations ||
                inclusion.relation in scope.include
        );

        /** Filter inclusion scope (Filter), recursively */
        filter.include = await Promise.all(
            filter.include.map(async inclusion => {
                // const filterAccess = scope.include[inclusion.relation][access];

                // if (filterAccess) {
                //     const filterCondition = filterAccess[0];
                //     const filterMethod = filterAccess[1];

                //     return await authorizeFn<any>(
                //         filterCondition,
                //         (invocationCtx.target as ACLController).session
                //             .permissions,
                //         invocationCtx
                //     );
                // }

                inclusion.scope = await filterFilter<
                    any,
                    Permissions,
                    Controller
                >(
                    ctor.definition.relations[inclusion.relation].target(),
                    inclusion.scope,
                    scope.include[inclusion.relation],
                    access,
                    invocationCtx
                );

                return inclusion;
            })
        );

        /** Remove undefined inclusions */
        filter.include = filter.include.filter(inclusion => Boolean(inclusion));
    }

    return filter;
}

export async function filterWhere<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    ctor: Ctor<Model>,
    where: Where<Model> | undefined,
    scope: FilterScope<Model, Permissions, Controller>,
    access: "create" | "read" | "update" | "delete" | "history",
    invocationCtx: InvocationContext
): Promise<Where<Model>> {
    where = where || {};

    const filterAccess = scope[access];
    if (filterAccess) {
        const filterCondition = filterAccess[0];
        const filterMethod = filterAccess[1];

        return await filterMethod(invocationCtx, where);
    }

    return {
        id: null
    } as any;
}
