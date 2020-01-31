import { ACLController } from "../../servers";
import {
    Entity,
    Count,
    CountSchema,
    Filter,
    Where,
    Class,
    RelationType
} from "@loopback/repository";
import {
    get,
    post,
    put,
    del,
    param,
    requestBody,
    getModelSchemaRef,
    getWhereSchemaFor,
    getFilterSchemaFor
} from "@loopback/rest";
import { Ctor } from "loopback-history-extension";
import { Condition } from "loopback-authorization-extension";

import { authenticate } from "@loopback/authentication";
import { authorize } from "loopback-authorization-extension";
import { intercept } from "@loopback/core";
import { validate, unique } from "../../interceptors";
import {
    RepositoryGetter,
    ValidateModel,
    FilterScope,
    ACLPermissions
} from "../../types";

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

// export function CreateControllerMixin<
//     Model extends Entity,
//     Permissions extends ACLPermissions,
//     Controller
// >(
//     controllerClass: Class<ACLController>,
//     rootCtor: Ctor<Model>,
//     rootRepositoryGetter: RepositoryGetter<Model, Controller>,
//     leafCtor: Ctor<Model>,
//     leafRepositoryGetter: RepositoryGetter<Model, Controller>,
//     access: [Condition<Permissions>, ValidateModel<Model>],
//     basePath: string
// ): Class<Controller> {
//     class MixedController extends controllerClass {
//         /**
//          * Create operations
//          *
//          * 1. validate
//          * 2. unique
//          */

//         @intercept(validate(nodeCtor, relationsIds.length))
//         @intercept(
//             unique(nodeCtor, repositoryGetter, false, relationsIds.length)
//         )
//         // @intercept(filter(ctor, ))
//         @authorize(access[0])
//         @authenticate("bearer")
//         @post(`${basePath}`, {
//             responses: {
//                 "200": {
//                     description: `Create multiple ${ctor.name}`,
//                     content: {
//                         "application/json": {
//                             schema: {
//                                 type: "array",
//                                 items: getModelSchemaRef(ctor)
//                             }
//                         }
//                     }
//                 }
//             }
//         })
//         async createAll(...args: any[]): Promise<Model[]> {
//             /**
//              * args[0]: id
//              * args[1]: id
//              * ...
//              * args[n-1]: id
//              * args[n]: Model[]
//              */

//             return await repositoryGetter(this as any).createAll(models);
//         }

//         @intercept(validate(nodeCtor, relationsIds.length))
//         @intercept(
//             unique(nodeCtor, repositoryGetter, false, relationsIds.length)
//         )
//         @authorize(access[0])
//         @authenticate("bearer")
//         @post(`${basePath}/one`, {
//             responses: {
//                 "200": {
//                     description: `Create single ${ctor.name}`,
//                     content: {
//                         "application/json": {
//                             schema: getModelSchemaRef(ctor)
//                         }
//                     }
//                 }
//             }
//         })
//         async createOne(...args: any[]): Promise<Model> {
//             /**
//              * args[0]: id
//              * args[1]: id
//              * ...
//              * args[n-1]: id
//              * args[n]: Model
//              */

//             return await repositoryGetter(this as any).create(model);
//         }
//     }

//     /** Decorate createAll arguments */
//     relationsIds.forEach((relationId, index) => {
//         param.path.string(relationId)(
//             MixedController.prototype,
//             "createAll",
//             index
//         );
//     });

//     requestBody({
//         content: {
//             "application/json": {
//                 schema: {
//                     type: "array",
//                     items: getModelSchemaRef(ctor, {
//                         exclude: ["uid", "beginDate", "endDate", "id"] as any
//                     })
//                 }
//             }
//         }
//     })(MixedController.prototype, "createAll", relationsIds.length);

//     /** Decorate createOne arguments */
//     relationsIds.forEach((relationId, index) => {
//         param.path.string(relationId)(
//             MixedController.prototype,
//             "createOne",
//             index
//         );
//     });

//     requestBody({
//         content: {
//             "application/json": {
//                 schema: getModelSchemaRef(ctor, {
//                     exclude: ["uid", "beginDate", "endDate", "id"] as any
//                 })
//             }
//         }
//     })(MixedController.prototype, "createOne", relationsIds.length);

//     return MixedController as any;
// }
// export function ReadControllerMixin<
//     Model extends Entity,
//     Permissions extends ACLPermissions,
//     Controller
// >(
//     controllerClass: Class<ACLController>,
//     ctor: Ctor<Model>,
//     ctorId: string,
//     repositoryGetter: RepositoryGetter<Model, Controller>,
//     access: FilterAccess<Model, Permissions>,
//     basePath: string
// ): Class<Controller> {
//     class MixedController extends controllerClass {
//         /**
//          * Read operations
//          *
//          * 1. filter
//          */

//         @intercept(filter(ctor, "read", 0, "filter", 0, "filter"))
//         // @authorize(getAccessPermission(ctor, "read"))
//         @authenticate("bearer")
//         @get(`${basePath}`, {
//             responses: {
//                 "200": {
//                     description: `Read multiple ${ctor.name} by filter`,
//                     content: {
//                         "application/json": {
//                             schema: {
//                                 type: "array",
//                                 items: getModelSchemaRef(ctor, {
//                                     includeRelations: true
//                                 })
//                             }
//                         }
//                     }
//                 }
//             }
//         })
//         async readAll(filter?: Filter<Model>): Promise<Model[]> {
//             return await repositoryGetter(this as any).find(filter);
//         }

//         @intercept(filter(ctor, "read", 0, "where", 0, "where"))
//         // @authorize(getAccessPermission(ctor, "read"))
//         @authenticate("bearer")
//         @get(`${basePath}/count`, {
//             responses: {
//                 "200": {
//                     description: `Read ${ctor.name} count by where`,
//                     content: {
//                         "application/json": {
//                             schema: CountSchema
//                         }
//                     }
//                 }
//             }
//         })
//         async countAll(where?: Where<Model>): Promise<Count> {
//             return await repositoryGetter(this as any).count(where);
//         }

//         // @intercept(exist(ctor, 0, repositoryGetter))
//         @intercept(
//             filter(ctor, "read", 1, "filter", 1, "filter", {
//                 arg: 0,
//                 property: ctorId as string
//             })
//         )
//         // @authorize(getAccessPermission(ctor, "read"))
//         @authenticate("bearer")
//         @get(`${basePath}/{id}`, {
//             responses: {
//                 "200": {
//                     description: `Read single ${ctor.name} by id`,
//                     content: {
//                         "application/json": {
//                             schema: getModelSchemaRef(ctor, {
//                                 includeRelations: true
//                             })
//                         }
//                     }
//                 }
//             }
//         })
//         async readOne(id: string, filter?: Filter<Model>): Promise<Model> {
//             return await repositoryGetter(this as any).findOne(filter);
//         }
//     }

//     /** Decorate readAll arguments */
//     param.query.object("filter", getFilterSchemaFor(ctor), {
//         description: `Filter ${ctor.name}`
//     })(MixedController.prototype, "readAll", 0);

//     /** Decorate countAll arguments */
//     param.query.object("where", getWhereSchemaFor(ctor), {
//         description: `Where ${ctor.name}`
//     })(MixedController.prototype, "countAll", 0);

//     /** Decorate readOne arguments */
//     param.path.string("id")(MixedController.prototype, "readOne", 0);
//     param.query.object("filter", getFilterSchemaFor(ctor), {
//         description: `Filter ${ctor.name}`
//     })(MixedController.prototype, "readOne", 1);

//     return MixedController as any;
// }
// export function UpdateControllerMixin<
//     Model extends Entity,
//     Permissions extends ACLPermissions,
//     Controller
// >(
//     controllerClass: Class<ACLController>,
//     ctor: Ctor<Model>,
//     ctorId: string,
//     repositoryGetter: RepositoryGetter<Model, Controller>,
//     access: FilterAccess<Model, Permissions>,
//     basePath: string
// ): Class<Controller> {
//     class MixedController extends controllerClass {
//         /**
//          * Update operations
//          *
//          * 1. validate
//          * 2. unique
//          * 3. filter
//          */

//         @intercept(validate(ctor, 0))
//         @intercept(unique(ctor, repositoryGetter, true, 0))
//         @intercept(filter(ctor, "update", 1, "where", 1, "where"))
//         // @authorize(getAccessPermission(ctor, "update"))
//         @authenticate("bearer")
//         @put(`${basePath}`, {
//             responses: {
//                 "200": {
//                     description: `Update multiple ${ctor.name} by where`,
//                     schema: {
//                         type: "array",
//                         items: getModelSchemaRef(ctor)
//                     }
//                 }
//             }
//         })
//         async updateAll(model: Model, where?: Where<Model>): Promise<Model[]> {
//             await repositoryGetter(this as any).updateAll(model, where);

//             return await repositoryGetter(this as any).find({ where: where });
//         }

//         @intercept(validate(ctor, 0))
//         // @intercept(exist(ctor, 1, repositoryGetter))
//         @intercept(unique(ctor, 0, repositoryGetter, false))
//         @intercept(filter(ctor, "update", 1, ctorId as string, 2, "where"))
//         // @authorize(getAccessPermission(ctor, "update"))
//         @authenticate("bearer")
//         @put(`${basePath}/{id}`, {
//             responses: {
//                 "200": {
//                     description: `Update single ${ctor.name} by id`,
//                     schema: getModelSchemaRef(ctor)
//                 }
//             }
//         })
//         async updateOne(model: Model, id: string): Promise<Model> {
//             await repositoryGetter(this as any).updateAll(model, arguments[2]);

//             return await repositoryGetter(this as any).findById(id);
//         }
//     }

//     /** Decorate updateAll arguments */
//     requestBody({
//         content: {
//             "application/json": {
//                 schema: getModelSchemaRef(ctor, { partial: true })
//             }
//         }
//     })(MixedController.prototype, "updateAll", 0);
//     param.query.object("where", getWhereSchemaFor(ctor), {
//         description: `Where ${ctor.name}`
//     })(MixedController.prototype, "updateAll", 1);

//     /** Decorate updateOne arguments */
//     requestBody({
//         content: {
//             "application/json": {
//                 schema: getModelSchemaRef(ctor, { partial: true })
//             }
//         }
//     })(MixedController.prototype, "updateOne", 0);
//     param.path.string("id")(MixedController.prototype, "updateOne", 1);

//     return MixedController as any;
// }
// export function DeleteControllerMixin<
//     Model extends Entity,
//     Permissions extends ACLPermissions,
//     Controller
// >(
//     controllerClass: Class<ACLController>,
//     ctor: Ctor<Model>,
//     ctorId: string,
//     repositoryGetter: RepositoryGetter<Model, Controller>,
//     access: FilterAccess<Model, Permissions>,
//     basePath: string
// ): Class<Controller> {
//     class MixedController extends controllerClass {
//         /**
//          * Delete operations
//          *
//          * 1. filter
//          */

//         @intercept(filter(ctor, "delete", 0, "where", 0, "where"))
//         // @authorize(getAccessPermission(ctor, "delete"))
//         @authenticate("bearer")
//         @del(`${basePath}`, {
//             responses: {
//                 "200": {
//                     description: `Delete multiple ${ctor.name} by where`,
//                     content: {
//                         "application/json": {
//                             schema: CountSchema
//                         }
//                     }
//                 }
//             }
//         })
//         async deleteAll(where?: Where<Model>): Promise<Count> {
//             return await repositoryGetter(this as any).deleteAll(where);
//         }

//         // @intercept(exist(ctor, 0, repositoryGetter))
//         @intercept(filter(ctor, "delete", 0, ctorId as string, 1, "where"))
//         // @authorize(getAccessPermission(ctor, "delete"))
//         @authenticate("bearer")
//         @del(`${basePath}/{id}`, {
//             responses: {
//                 "200": {
//                     description: `Delete single ${ctor.name} by id`,
//                     content: {
//                         "application/json": {
//                             schema: CountSchema
//                         }
//                     }
//                 }
//             }
//         })
//         async deleteOne(id: string): Promise<Count> {
//             return await repositoryGetter(this as any).deleteAll(arguments[1]);
//         }
//     }

//     /** Decorate deleteAll arguments */
//     param.query.object("where", getWhereSchemaFor(ctor), {
//         description: `Where ${ctor.name}`
//     })(MixedController.prototype, "deleteAll", 0);

//     /** Decorate deleteOne arguments */
//     param.path.string("id")(MixedController.prototype, "deleteOne", 0);

//     return MixedController as any;
// }
// export function HistoryControllerMixin<
//     Model extends Entity,
//     Permissions extends ACLPermissions,
//     Controller
// >(
//     controllerClass: Class<ACLController>,
//     ctor: Ctor<Model>,
//     ctorId: string,
//     repositoryGetter: RepositoryGetter<Model, Controller>,
//     access: FilterAccess<Model, Permissions>,
//     basePath: string
// ): Class<Controller> {
//     class MixedController extends controllerClass {
//         /**
//          * History operations
//          *
//          * 1. filter
//          */

//         // @intercept(exist(ctor, 0, repositoryGetter))
//         @intercept(
//             filter(ctor, "history", 1, "filter", 1, "filter", {
//                 arg: 0,
//                 property: ctorId as string
//             })
//         )
//         // @authorize(getAccessPermission(ctor, "history"))
//         @authenticate("bearer")
//         @get(`${basePath}/{id}/history`, {
//             responses: {
//                 "200": {
//                     description: `Get ${ctor.name} history by filter`,
//                     content: {
//                         "application/json": {
//                             schema: {
//                                 type: "array",
//                                 items: getModelSchemaRef(ctor, {
//                                     includeRelations: true
//                                 })
//                             }
//                         }
//                     }
//                 }
//             }
//         })
//         async historyOne(id: string, filter?: Filter<Model>): Promise<Model[]> {
//             return await repositoryGetter(this as any).find(filter, {
//                 crud: true
//             });
//         }
//     }

//     /** Decorate historyOne arguments */
//     param.path.string("id")(MixedController.prototype, "historyOne", 0);
//     param.query.object("filter", getFilterSchemaFor(ctor), {
//         description: `Filter ${ctor.name}`
//     })(MixedController.prototype, "historyOne", 1);

//     return MixedController as any;
// }

export function CRUDControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    paths: Path<Model, Permissions, Controller>[],
    basePath: string
): Class<Controller> {
    const leafPath = paths[paths.length - 1];

    let modelPath = paths.reduce((accumulate, path, index) => {
        // const modelPath = (path.relation || path.ctor.name).toLowerCase();
        if (path.relation) {
            if (
                path.relation.type === RelationType.belongsTo ||
                path.relation.type === RelationType.hasOne
            ) {
                if (index < paths.length - 1) {
                    return `${accumulate}/${path.relation.name.toLowerCase()}`;
                } else {
                    return `${accumulate}/${path.relation.name.toLowerCase()}`;
                }
            } else if (path.relation.type === RelationType.hasMany) {
                if (index < paths.length - 1) {
                    return `${accumulate}/${path.relation.name.toLowerCase()}/{${path.ctor.name
                        .replace("s$", "")
                        .toLowerCase()}_id}`;
                } else {
                    return `${accumulate}/${path.relation.name.toLowerCase()}`;
                }
            }
        }

        if (index < paths.length - 1) {
            return `${accumulate}/${path.ctor.name.toLowerCase()}s/{${path.ctor.name.toLowerCase()}_id}`;
        } else {
            return `${accumulate}/${path.ctor.name.toLowerCase()}s`;
        }
    }, basePath);

    console.log(modelPath);

    // if ("create" in leafPath.scope) {
    //     controllerClass = CreateControllerMixin<Model, Permissions, Controller>(
    //         controllerClass,
    //         rootCtor,
    //         rootScope,
    //         nodeCtor,
    //         nodeScope,
    //         null,
    //         relationsIds,
    //         modelPath
    //     ) as any;
    // }

    // if ("read" in leafPath.scope) {
    //     // controllerClass = ReadControllerMixin<
    //     //     Model,
    //     //     Permissions,
    //     //     ACLController
    //     // >(
    //     //     controllerClass,
    //     //     scope.ctor,
    //     //     scope.ctorId as any,
    //     //     scope.repositoryGetter as any,
    //     //     scope.read as any,
    //     //     basePath
    //     // );
    // }

    // if ("update" in leafPath.scope) {
    //     // controllerClass = UpdateControllerMixin<
    //     //     Model,
    //     //     Permissions,
    //     //     ACLController
    //     // >(
    //     //     controllerClass,
    //     //     scope.ctor,
    //     //     scope.ctorId as any,
    //     //     scope.repositoryGetter as any,
    //     //     scope.update as any,
    //     //     basePath
    //     // );
    // }

    // if ("delete" in leafPath.scope) {
    //     // controllerClass = DeleteControllerMixin<
    //     //     Model,
    //     //     Permissions,
    //     //     ACLController
    //     // >(
    //     //     controllerClass,
    //     //     scope.ctor,
    //     //     scope.ctorId as any,
    //     //     scope.repositoryGetter as any,
    //     //     scope.delete as any,
    //     //     basePath
    //     // );
    // }

    // if ("history" in leafPath.scope) {
    //     // controllerClass = HistoryControllerMixin<
    //     //     Model,
    //     //     Permissions,
    //     //     ACLController
    //     // >(
    //     //     controllerClass,
    //     //     scope.ctor,
    //     //     scope.ctorId as any,
    //     //     scope.repositoryGetter as any,
    //     //     scope.history as any,
    //     //     basePath
    //     // );
    // }

    Object.entries(leafPath.scope.include).forEach(([relation, scope]) => {
        /** Check model has relation */
        if (relation in leafPath.ctor.definition.relations) {
            const relatedModel = leafPath.ctor.definition.relations[relation];

            controllerClass = CRUDControllerMixin<any, Permissions, Controller>(
                controllerClass,
                [
                    ...paths,
                    {
                        ctor: relatedModel.target(),
                        scope: scope,
                        relation: {
                            name: relation,
                            type: relatedModel.type
                        }
                    }
                ],
                basePath
            ) as any;
        }
    });

    return controllerClass as any;
}

export function ACLControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    ctor: Ctor<Model>,
    scope: FilterScope<Model, Permissions, Controller>,
    basePath: string
): Class<Controller> {
    return CRUDControllerMixin<Model, Permissions, Controller>(
        controllerClass,
        [{ ctor: ctor, scope: scope }],
        basePath
    );
}
