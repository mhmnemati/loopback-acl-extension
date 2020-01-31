import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { Entity, Filter, RelationType } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { authorizeFn } from "loopback-authorization-extension";

import { ACLPermissions, FilterScope } from "../types";

import { ACLController } from "../servers";

// export function filter<
//     Model extends Entity,
//     Permissions extends ACLPermissions,
//     Controller
// >(
//     ctor: Ctor<Model>,
//     rootScope: FilterScope<Model, Permissions, Controller>,
//     access: "create" | "read" | "update" | "delete" | "history",
//     argTypes: string | { type: "where" | "filter" } | undefined[],
//     outType: "where" | "filter"
// ): Interceptor {
//     return async (
//         invocationCtx: InvocationContext,
//         next: () => ValueOrPromise<InvocationResult>
//     ) => {
//         // TODO: generate filter from argTypes, invocationCtx.args
//         let filter = null as any;

//         let result: any = await filterFn(
//             ctor,
//             scope,
//             access,
//             filter,
//             invocationCtx
//         );
//         if (outType === "where") {
//             result = result.where;
//         }

//         invocationCtx.args.push(result);

//         return next();
//     };
// }

// export async function filterFn<
//     Model extends Entity,
//     Permissions extends ACLPermissions,
//     Controller
// >(
//     ctor: Ctor<Model>,
//     scope: FilterScope<Model, Permissions, Controller>,
//     access: "create" | "read" | "update" | "delete" | "history",
//     filter: Filter<Model> | undefined,
//     invocationCtx: InvocationContext
// ): Promise<Filter<Model>> {
//     filter = filter || {};
//     filter.where = filter.where || {};

//     /** Apply filter on `where` by scope and access */
//     const filterAccess = scope[access];
//     if (filterAccess) {
//         const filterCondition = filterAccess[0];
//         const filterMethod = filterAccess[1];

//         filter.where = await filterMethod(invocationCtx, filter.where);
//     } else {
//         return {
//             where: { id: null }
//         } as any;
//     }

//     /** Apply filter on `include` by scope and filter */
//     if (filter.include) {
//         /** Remove inclusions that not exist in `model` or `scope` relations */
//         filter.include = filter.include.filter(
//             inclusion =>
//                 inclusion.relation in ctor.definition.relations ||
//                 inclusion.relation in scope.include
//         );

//         /**
//          * Remove inclusions that hasn't access permission
//          * Remove undefined inclusions
//          * */
//         filter.include = (
//             await Promise.all(
//                 filter.include.map(async inclusion => {
//                     const filterAccess =
//                         scope.include[inclusion.relation][access];

//                     if (filterAccess) {
//                         const filterCondition = filterAccess[0];
//                         const filterMethod = filterAccess[1];

//                         if (
//                             await authorizeFn<any>(
//                                 filterCondition,
//                                 (invocationCtx.target as ACLController).session
//                                     .permissions,
//                                 invocationCtx
//                             )
//                         ) {
//                             return inclusion;
//                         }
//                     }

//                     return undefined;
//                 })
//             )
//         ).filter(inclusion => Boolean(inclusion)) as any[];

//         /** Filter inclusion scope (Filter), recursively */
//         filter.include = await Promise.all(
//             filter.include.map(async inclusion => {
//                 inclusion.scope = await filterFn<any, Permissions, Controller>(
//                     ctor.definition.relations[inclusion.relation].target(),
//                     scope.include[inclusion.relation],
//                     access,
//                     inclusion.scope,
//                     invocationCtx
//                 );

//                 return inclusion;
//             })
//         );
//     }

//     return filter;
// }

export interface Path<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
> {
    ctor: Ctor<Model>;
    scope: FilterScope<Model, Permissions, Controller>;
    relation?: {
        name: string;
        type: RelationType;
    };
}

/**
 * Generator example:
 *
 * [
 *  User        -   ()          -   ()          =>  /users
 *  UserRole    -   (userRoles) -   (hasMany)   =>  /{user_id}/userroles
 *  Role        -   (role)      -   (belongsTo) =>  /{userrole_id}/role
 *  RolePerm    -   (rolePerms) -   (hasMany)   =>  /rolepermissions
 *  Permission  -   (permissio) -   (belongsTo) =>  /{roleperm_id}/permission
 *  Key         -   (key)       -   (hasOne)    =>  /key
 *  Data        -   (datas)     -   (hasMany)   =>  /datas
 *  ...
 * ].reduce()
 *
 * if (previousPath && (
 *      !previousPath.relation ||
 *      previousPath.relation.type === hasMany
 * )) {
 *      /{model_id}
 * }
 *
 * if (!path.relation || path.relation.type === hasMany) {
 *      /model{s}
 * } else {
 *      /model
 * }
 */
export function getModelPathId<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(path?: Path<Model, Permissions, Controller>) {
    if (path) {
        let property = "id";
        if (!("id" in path.ctor.definition.properties)) {
            property = path.ctor.getIdProperties()[0];
        }

        if (path.relation) {
            if (path.relation.type === RelationType.hasMany) {
                return {
                    property: property,
                    id: `${path.relation.name
                        .replace(/s$/, "")
                        .toLowerCase()}_id`
                };
            }
        } else {
            return {
                property: property,
                id: `${path.ctor.name.toLowerCase()}_id`
            };
        }
    }

    return undefined;
}

export function getModelPathName<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(path: Path<Model, Permissions, Controller>) {
    if (path.relation) {
        return `${path.relation.name.toLowerCase()}`;
    } else {
        return `${path.ctor.name.toLowerCase()}s`;
    }
}

export function generatePath<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[], basePath: string) {
    return paths.reduce((accumulate, path, index) => {
        const pathId = getModelPathId(paths[index - 1]);
        const pathName = getModelPathName(path);

        if (pathId) {
            return `${accumulate}/{${pathId.id}}/${pathName}`;
        } else {
            return `${accumulate}/${pathName}`;
        }
    }, basePath);
}

export function generateIds<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[]) {
    return paths
        .map((path, index) => getModelPathId(paths[index - 1])?.id)
        .filter(id => Boolean(id));
}

export function generateFilter<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(paths: Path<Model, Permissions, Controller>[]) {
    let filter: Filter<Model> = {};

    paths = [...paths];
    paths.pop();

    paths.reduce((accumulate, path, index) => {
        const pathId = getModelPathId(path);

        if (pathId) {
            accumulate.include = [
                {
                    relation: path.relation?.name || "",
                    scope: {
                        where: {
                            [pathId.property]: pathId.id
                        }
                    }
                }
            ];
        } else {
            accumulate.include = [
                {
                    relation: path.relation?.name || "",
                    scope: {}
                }
            ];
        }

        return accumulate.include[0].scope as any;
    }, filter);

    if (filter.include) {
        return filter.include[0].scope;
    }
}
