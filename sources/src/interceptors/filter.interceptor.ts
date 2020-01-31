// import {
//     Interceptor,
//     InvocationContext,
//     InvocationResult,
//     ValueOrPromise
// } from "@loopback/context";
// import { Entity, Filter } from "@loopback/repository";
// import { Ctor } from "loopback-history-extension";
// import { authorizeFn } from "loopback-authorization-extension";

// import { ACLPermissions, FilterScope } from "../types";

// import { ACLController } from "../servers";

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
