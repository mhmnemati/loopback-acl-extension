import { ACLController } from "../../servers";
import { Entity, Count, CountSchema, Class } from "@loopback/repository";
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

import { authenticate } from "@loopback/authentication";
import { authorize } from "loopback-authorization-extension";
import { intercept } from "@loopback/core";
import {
    validate,
    unique,
    exist,
    filter,
    generatePath
} from "../../interceptors";
import { FilterScope, ACLPermissions } from "../../types";

export function CreateControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    rootCtor: Ctor<Model>,
    rootScope: FilterScope<Model, Permissions, Controller>,
    leafCtor: Ctor<Model>,
    leafScope: FilterScope<Model, Permissions, Controller>,
    relations: string[],
    basePath: string
): Class<Controller> {
    const ids = ["user_id"];

    const condition = (leafScope as any).create[0];
    const validator = (leafScope as any).create[1];

    class MixedController extends controllerClass {
        /**
         * Create operations
         *
         * 1. validate
         * 2. unique
         * 3. exist
         */

        @intercept(validate(leafCtor, ids.length, validator))
        @intercept(unique(leafCtor, leafScope, ids.length, false))
        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @authorize(condition)
        @authenticate("bearer")
        @post(`${generatePath(rootCtor, relations, basePath)}`, {
            responses: {
                "200": {
                    description: `Create multiple ${leafCtor.name}`,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: getModelSchemaRef(leafCtor)
                            }
                        }
                    }
                }
            }
        })
        async createAll(...args: any[]): Promise<Model[]> {
            /**
             * args[0]: id
             * args[1]: id
             * ...
             * args[n-1]: id
             * args[n]: Model[]
             */

            return await leafScope
                .repositoryGetter(this as any)
                .createAll(args[args.length - 2]);
        }

        @intercept(validate(leafCtor, ids.length, validator))
        @intercept(unique(leafCtor, leafScope, ids.length, false))
        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @authorize(condition)
        @authenticate("bearer")
        @post(`${generatePath(rootCtor, relations, basePath)}/one`, {
            responses: {
                "200": {
                    description: `Create single ${leafCtor.name}`,
                    content: {
                        "application/json": {
                            schema: getModelSchemaRef(leafCtor)
                        }
                    }
                }
            }
        })
        async createOne(...args: any[]): Promise<Model> {
            /**
             * args[0]: id
             * args[1]: id
             * ...
             * args[n-1]: id
             * args[n]: Model
             */

            return await leafScope
                .repositoryGetter(this as any)
                .create(args[args.length - 2]);
        }
    }

    /** Decorate createAll arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "createAll", index);
    });

    requestBody({
        content: {
            "application/json": {
                schema: {
                    type: "array",
                    items: getModelSchemaRef(leafCtor, {
                        exclude: ["uid", "beginDate", "endDate", "id"] as any
                    })
                }
            }
        }
    })(MixedController.prototype, "createAll", ids.length);

    /** Decorate createOne arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "createOne", index);
    });

    requestBody({
        content: {
            "application/json": {
                schema: getModelSchemaRef(leafCtor, {
                    exclude: ["uid", "beginDate", "endDate", "id"] as any
                })
            }
        }
    })(MixedController.prototype, "createOne", ids.length);

    return MixedController as any;
}

export function ReadControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    rootCtor: Ctor<Model>,
    rootScope: FilterScope<Model, Permissions, Controller>,
    leafCtor: Ctor<Model>,
    leafScope: FilterScope<Model, Permissions, Controller>,
    relations: string[],
    basePath: string
): Class<Controller> {
    const ids = ["user_id"];

    const condition = (leafScope as any).read[0];

    class MixedController extends controllerClass {
        /**
         * Read operations
         *
         * 1. exist
         * 2. filter
         */

        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "read",
                "filter",
                ids.length + 1,
                undefined,
                { index: ids.length, type: "filter" }
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @get(`${generatePath(rootCtor, relations, basePath)}`, {
            responses: {
                "200": {
                    description: `Read multiple ${leafCtor.name} by filter`,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: getModelSchemaRef(leafCtor, {
                                    includeRelations: true
                                })
                            }
                        }
                    }
                }
            }
        })
        async readAll(...args: any[]): Promise<Model[]> {
            return await leafScope
                .repositoryGetter(this as any)
                .find(args[args.length - 1]);
        }

        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "read",
                "where",
                ids.length + 1,
                undefined,
                { index: ids.length, type: "where" }
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @get(`${generatePath(rootCtor, relations, basePath)}/count`, {
            responses: {
                "200": {
                    description: `Read ${leafCtor.name} count by where`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async countAll(...args: any[]): Promise<Count> {
            return await leafScope
                .repositoryGetter(this as any)
                .count(args[args.length - 1]);
        }

        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "read",
                "filter",
                ids.length + 2,
                ids.length,
                { index: ids.length + 1, type: "filter" }
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @get(`${generatePath(rootCtor, relations, basePath)}/{id}`, {
            responses: {
                "200": {
                    description: `Read single ${leafCtor.name} by id`,
                    content: {
                        "application/json": {
                            schema: getModelSchemaRef(leafCtor, {
                                includeRelations: true
                            })
                        }
                    }
                }
            }
        })
        async readOne(...args: any[]): Promise<Model> {
            return await leafScope
                .repositoryGetter(this as any)
                .findOne(args[args.length - 1]);
        }
    }

    /** Decorate readAll arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "readAll", index);
    });

    param.query.object("filter", getFilterSchemaFor(leafCtor), {
        description: `Filter ${leafCtor.name}`
    })(MixedController.prototype, "readAll", ids.length);

    /** Decorate countAll arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "countAll", index);
    });

    param.query.object("where", getWhereSchemaFor(leafCtor), {
        description: `Where ${leafCtor.name}`
    })(MixedController.prototype, "countAll", ids.length);

    /** Decorate readOne arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "readOne", index);
    });

    param.path.string("id")(MixedController.prototype, "readOne", ids.length);
    param.query.object("filter", getFilterSchemaFor(leafCtor), {
        description: `Filter ${leafCtor.name}`
    })(MixedController.prototype, "readOne", ids.length + 1);

    return MixedController as any;
}

export function UpdateControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    rootCtor: Ctor<Model>,
    rootScope: FilterScope<Model, Permissions, Controller>,
    leafCtor: Ctor<Model>,
    leafScope: FilterScope<Model, Permissions, Controller>,
    relations: string[],
    basePath: string
): Class<Controller> {
    const ids = ["user_id"];

    const condition = (leafScope as any).update[0];
    const validator = (leafScope as any).update[2];

    class MixedController extends controllerClass {
        /**
         * Update operations
         *
         * 1. validate
         * 2. unique
         * 3. exist
         * 4. filter
         */

        @intercept(validate(leafCtor, ids.length, validator))
        @intercept(unique(leafCtor, leafScope, ids.length, true))
        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "update",
                "where",
                ids.length + 2,
                undefined,
                { index: ids.length + 1, type: "where" }
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @put(`${generatePath(rootCtor, relations, basePath)}`, {
            responses: {
                "200": {
                    description: `Update multiple ${leafCtor.name} by where`,
                    schema: {
                        type: "array",
                        items: getModelSchemaRef(leafCtor)
                    }
                }
            }
        })
        async updateAll(...args: any[]): Promise<Model[]> {
            await leafScope
                .repositoryGetter(this as any)
                .updateAll(args[args.length - 4], args[args.length - 1]);

            return await leafScope
                .repositoryGetter(this as any)
                .find(args[args.length - 1]);
        }

        @intercept(validate(leafCtor, ids.length, validator))
        @intercept(unique(leafCtor, leafScope, ids.length, true))
        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "update",
                "where",
                ids.length + 2,
                ids.length + 1,
                undefined
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @put(`${generatePath(rootCtor, relations, basePath)}/{id}`, {
            responses: {
                "200": {
                    description: `Update single ${leafCtor.name} by id`,
                    schema: getModelSchemaRef(leafCtor)
                }
            }
        })
        async updateOne(...args: any[]): Promise<Model> {
            await leafScope
                .repositoryGetter(this as any)
                .updateAll(args[args.length - 4], args[args.length - 1]);

            return await leafScope
                .repositoryGetter(this as any)
                .findById(args[args.length - 3]);
        }
    }

    /** Decorate updateAll arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "updateAll", index);
    });

    requestBody({
        content: {
            "application/json": {
                schema: getModelSchemaRef(leafCtor, { partial: true })
            }
        }
    })(MixedController.prototype, "updateAll", ids.length);
    param.query.object("where", getWhereSchemaFor(leafCtor), {
        description: `Where ${leafCtor.name}`
    })(MixedController.prototype, "updateAll", ids.length + 1);

    /** Decorate updateOne arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "updateOne", index);
    });

    requestBody({
        content: {
            "application/json": {
                schema: getModelSchemaRef(leafCtor, { partial: true })
            }
        }
    })(MixedController.prototype, "updateOne", ids.length);
    param.path.string("id")(
        MixedController.prototype,
        "updateOne",
        ids.length + 1
    );

    return MixedController as any;
}

export function DeleteControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    rootCtor: Ctor<Model>,
    rootScope: FilterScope<Model, Permissions, Controller>,
    leafCtor: Ctor<Model>,
    leafScope: FilterScope<Model, Permissions, Controller>,
    relations: string[],
    basePath: string
): Class<Controller> {
    const ids = ["user_id"];

    const condition = (leafScope as any).delete[0];

    class MixedController extends controllerClass {
        /**
         * Delete operations
         *
         * 1. exist
         * 2. filter
         */

        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "delete",
                "where",
                ids.length + 1,
                undefined,
                { index: ids.length, type: "where" }
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @del(`${generatePath(rootCtor, relations, basePath)}`, {
            responses: {
                "200": {
                    description: `Delete multiple ${leafCtor.name} by where`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async deleteAll(...args: any[]): Promise<Count> {
            return await leafScope
                .repositoryGetter(this as any)
                .deleteAll(args[args.length - 1]);
        }

        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "delete",
                "where",
                ids.length + 1,
                ids.length,
                undefined
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @del(`${generatePath(rootCtor, relations, basePath)}/{id}`, {
            responses: {
                "200": {
                    description: `Delete single ${leafCtor.name} by id`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async deleteOne(...args: any[]): Promise<Count> {
            return await leafScope
                .repositoryGetter(this as any)
                .deleteAll(args[args.length - 1]);
        }
    }

    /** Decorate deleteAll arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "deleteAll", index);
    });

    param.query.object("where", getWhereSchemaFor(leafCtor), {
        description: `Where ${leafCtor.name}`
    })(MixedController.prototype, "deleteAll", ids.length);

    /** Decorate deleteOne arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "deleteOne", index);
    });

    param.path.string("id")(MixedController.prototype, "deleteOne", ids.length);

    return MixedController as any;
}

export function HistoryControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    rootCtor: Ctor<Model>,
    rootScope: FilterScope<Model, Permissions, Controller>,
    leafCtor: Ctor<Model>,
    leafScope: FilterScope<Model, Permissions, Controller>,
    relations: string[],
    basePath: string
): Class<Controller> {
    const ids = ["user_id"];

    const condition = (leafScope as any).history[0];

    class MixedController extends controllerClass {
        /**
         * History operations
         *
         * 1. exist
         * 2. filter
         */

        @intercept(exist(rootCtor, rootScope, 0, ids.length - 1, relations))
        @intercept(
            filter(
                leafCtor,
                leafScope,
                "history",
                "filter",
                ids.length + 2,
                ids.length,
                { index: ids.length + 1, type: "filter" }
            )
        )
        @authorize(condition)
        @authenticate("bearer")
        @get(`${generatePath(rootCtor, relations, basePath)}/{id}/history`, {
            responses: {
                "200": {
                    description: `Get ${leafCtor.name} history by filter`,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: getModelSchemaRef(leafCtor, {
                                    includeRelations: true
                                })
                            }
                        }
                    }
                }
            }
        })
        async historyOne(...args: any[]): Promise<Model[]> {
            return await leafScope
                .repositoryGetter(this as any)
                .find(args[args.length - 1], {
                    crud: true
                });
        }
    }

    /** Decorate historyOne arguments */
    ids.forEach((id, index) => {
        param.path.string(id)(MixedController.prototype, "historyOne", index);
    });

    param.path.string("id")(
        MixedController.prototype,
        "historyOne",
        ids.length
    );
    param.query.object("filter", getFilterSchemaFor(leafCtor), {
        description: `Filter ${leafCtor.name}`
    })(MixedController.prototype, "historyOne", ids.length + 1);

    return MixedController as any;
}

export function CRUDControllerMixin<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    controllerClass: Class<ACLController>,
    ctors: Ctor<Model>[],
    scopes: FilterScope<Model, Permissions, Controller>[],
    relations: string[],
    basePath: string
): Class<Controller> {
    const rootCtor = ctors[0];
    const rootScope = scopes[0];

    const leafCtor = ctors[ctors.length - 1];
    const leafScope = scopes[scopes.length - 1];

    if ("create" in leafScope) {
        controllerClass = CreateControllerMixin<Model, Permissions, Controller>(
            controllerClass,
            rootCtor,
            rootScope,
            leafCtor,
            leafScope,
            relations,
            basePath
        ) as any;
    }

    controllerClass = ReadControllerMixin<Model, Permissions, Controller>(
        controllerClass,
        rootCtor,
        rootScope,
        leafCtor,
        leafScope,
        relations,
        basePath
    ) as any;

    if ("update" in leafScope) {
        controllerClass = UpdateControllerMixin<Model, Permissions, Controller>(
            controllerClass,
            rootCtor,
            rootScope,
            leafCtor,
            leafScope,
            relations,
            basePath
        ) as any;
    }

    if ("delete" in leafScope) {
        controllerClass = DeleteControllerMixin<Model, Permissions, Controller>(
            controllerClass,
            rootCtor,
            rootScope,
            leafCtor,
            leafScope,
            relations,
            basePath
        ) as any;
    }

    if ("history" in leafScope) {
        controllerClass = HistoryControllerMixin<
            Model,
            Permissions,
            Controller
        >(
            controllerClass,
            rootCtor,
            rootScope,
            leafCtor,
            leafScope,
            relations,
            basePath
        ) as any;
    }

    Object.entries(leafScope.include).forEach(([relation, scope]) => {
        /** Check model has relation */
        if (relation in leafCtor.definition.relations) {
            const modelRelation = leafCtor.definition.relations[relation];

            controllerClass = CRUDControllerMixin<any, Permissions, any>(
                controllerClass,
                [...ctors, modelRelation.target()],
                [...scopes, scope],
                [...relations, relation],
                basePath
            );
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
        [ctor],
        [scope],
        [],
        basePath
    );
}
