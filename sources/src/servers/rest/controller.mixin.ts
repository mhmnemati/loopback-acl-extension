import { ACLController } from "../../servers";
import {
    Entity,
    Count,
    CountSchema,
    Filter,
    Where,
    Class
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

import { authenticate } from "@loopback/authentication";
import { authorize } from "loopback-authorization-extension";
import { intercept } from "@loopback/core";
import { validate, unique, filter } from "../../interceptors";
import { RepositoryGetter } from "../../types";

export interface Path<Model extends Entity, Controller> {
    ctorId: keyof Model;
    repositoryGetter: RepositoryGetter<Model, Controller>;
    relations: {
        [relation: string]: Path<Model, Controller>;
    };
}

export function CreateControllerMixin<Model extends Entity, Controller>(
    controllerClass: Class<ACLController>,
    repositoryGetter: RepositoryGetter<Model, Controller>,
    ctor: Ctor<Model>,
    ctorId: string,
    basePath: string
): Class<Controller> {
    class MixedController extends controllerClass {
        /**
         * Create operations
         *
         * 1. validate
         * 2. unique
         */

        @intercept(validate(ctor, 0))
        @intercept(unique(ctor, 0, repositoryGetter, false))
        // @authorize(getAccessPermission(ctor, "create"))
        @authenticate("bearer")
        @post(`${basePath}`, {
            responses: {
                "200": {
                    description: `Create multiple ${ctor.name}`,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: getModelSchemaRef(ctor)
                            }
                        }
                    }
                }
            }
        })
        async createAll(models: Model[]): Promise<Model[]> {
            return await repositoryGetter(this as any).createAll(models);
        }

        @intercept(validate(ctor, 0))
        @intercept(unique(ctor, 0, repositoryGetter, false))
        // @authorize(getAccessPermission(ctor, "create"))
        @authenticate("bearer")
        @post(`${basePath}/one`, {
            responses: {
                "200": {
                    description: `Create single ${ctor.name}`,
                    content: {
                        "application/json": {
                            schema: getModelSchemaRef(ctor)
                        }
                    }
                }
            }
        })
        async createOne(model: Model): Promise<Model> {
            return await repositoryGetter(this as any).create(model);
        }
    }

    /** Decorate createAll arguments */
    requestBody({
        content: {
            "application/json": {
                schema: {
                    type: "array",
                    items: getModelSchemaRef(ctor, {
                        exclude: ["uid", "beginDate", "endDate", "id"] as any
                    })
                }
            }
        }
    })(MixedController.prototype, "createAll", 0);

    /** Decorate createOne arguments */
    requestBody({
        content: {
            "application/json": {
                schema: getModelSchemaRef(ctor, {
                    exclude: ["uid", "beginDate", "endDate", "id"] as any
                })
            }
        }
    })(MixedController.prototype, "createOne", 0);

    return MixedController as any;
}
export function ReadControllerMixin<Model extends Entity, Controller>(
    controllerClass: Class<ACLController>,
    repositoryGetter: RepositoryGetter<Model, Controller>,
    ctor: Ctor<Model>,
    ctorId: string,
    basePath: string
): Class<Controller> {
    class MixedController extends controllerClass {
        /**
         * Read operations
         *
         * 1. filter
         */

        @intercept(filter(ctor, "read", 0, "filter", 0, "filter"))
        // @authorize(getAccessPermission(ctor, "read"))
        @authenticate("bearer")
        @get(`${basePath}`, {
            responses: {
                "200": {
                    description: `Read multiple ${ctor.name} by filter`,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: getModelSchemaRef(ctor, {
                                    includeRelations: true
                                })
                            }
                        }
                    }
                }
            }
        })
        async readAll(filter?: Filter<Model>): Promise<Model[]> {
            return await repositoryGetter(this as any).find(filter);
        }

        @intercept(filter(ctor, "read", 0, "where", 0, "where"))
        // @authorize(getAccessPermission(ctor, "read"))
        @authenticate("bearer")
        @get(`${basePath}/count`, {
            responses: {
                "200": {
                    description: `Read ${ctor.name} count by where`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async countAll(where?: Where<Model>): Promise<Count> {
            return await repositoryGetter(this as any).count(where);
        }

        // @intercept(exist(ctor, 0, repositoryGetter))
        @intercept(
            filter(ctor, "read", 1, "filter", 1, "filter", {
                arg: 0,
                property: ctorId as string
            })
        )
        // @authorize(getAccessPermission(ctor, "read"))
        @authenticate("bearer")
        @get(`${basePath}/{id}`, {
            responses: {
                "200": {
                    description: `Read single ${ctor.name} by id`,
                    content: {
                        "application/json": {
                            schema: getModelSchemaRef(ctor, {
                                includeRelations: true
                            })
                        }
                    }
                }
            }
        })
        async readOne(id: string, filter?: Filter<Model>): Promise<Model> {
            return await repositoryGetter(this as any).findOne(filter);
        }
    }

    /** Decorate readAll arguments */
    param.query.object("filter", getFilterSchemaFor(ctor), {
        description: `Filter ${ctor.name}`
    })(MixedController.prototype, "readAll", 0);

    /** Decorate countAll arguments */
    param.query.object("where", getWhereSchemaFor(ctor), {
        description: `Where ${ctor.name}`
    })(MixedController.prototype, "countAll", 0);

    /** Decorate readOne arguments */
    param.path.string("id")(MixedController.prototype, "readOne", 0);
    param.query.object("filter", getFilterSchemaFor(ctor), {
        description: `Filter ${ctor.name}`
    })(MixedController.prototype, "readOne", 1);

    return MixedController as any;
}
export function UpdateControllerMixin<Model extends Entity, Controller>(
    controllerClass: Class<ACLController>,
    repositoryGetter: RepositoryGetter<Model, Controller>,
    ctor: Ctor<Model>,
    ctorId: string,
    basePath: string
): Class<Controller> {
    class MixedController extends controllerClass {
        /**
         * Update operations
         *
         * 1. validate
         * 2. unique
         * 3. filter
         */

        @intercept(validate(ctor, 0))
        @intercept(unique(ctor, 0, repositoryGetter, true))
        @intercept(filter(ctor, "update", 1, "where", 1, "where"))
        // @authorize(getAccessPermission(ctor, "update"))
        @authenticate("bearer")
        @put(`${basePath}`, {
            responses: {
                "200": {
                    description: `Update multiple ${ctor.name} by where`,
                    schema: {
                        type: "array",
                        items: getModelSchemaRef(ctor)
                    }
                }
            }
        })
        async updateAll(model: Model, where?: Where<Model>): Promise<Model[]> {
            await repositoryGetter(this as any).updateAll(model, where);

            return await repositoryGetter(this as any).find({ where: where });
        }

        @intercept(validate(ctor, 0))
        // @intercept(exist(ctor, 1, repositoryGetter))
        @intercept(unique(ctor, 0, repositoryGetter, false))
        @intercept(filter(ctor, "update", 1, ctorId as string, 2, "where"))
        // @authorize(getAccessPermission(ctor, "update"))
        @authenticate("bearer")
        @put(`${basePath}/{id}`, {
            responses: {
                "200": {
                    description: `Update single ${ctor.name} by id`,
                    schema: getModelSchemaRef(ctor)
                }
            }
        })
        async updateOne(model: Model, id: string): Promise<Model> {
            await repositoryGetter(this as any).updateAll(model, arguments[2]);

            return await repositoryGetter(this as any).findById(id);
        }
    }

    /** Decorate updateAll arguments */
    requestBody({
        content: {
            "application/json": {
                schema: getModelSchemaRef(ctor, { partial: true })
            }
        }
    })(MixedController.prototype, "updateAll", 0);
    param.query.object("where", getWhereSchemaFor(ctor), {
        description: `Where ${ctor.name}`
    })(MixedController.prototype, "updateAll", 1);

    /** Decorate updateOne arguments */
    requestBody({
        content: {
            "application/json": {
                schema: getModelSchemaRef(ctor, { partial: true })
            }
        }
    })(MixedController.prototype, "updateOne", 0);
    param.path.string("id")(MixedController.prototype, "updateOne", 1);

    return MixedController as any;
}
export function DeleteControllerMixin<Model extends Entity, Controller>(
    controllerClass: Class<ACLController>,
    repositoryGetter: RepositoryGetter<Model, Controller>,
    ctor: Ctor<Model>,
    ctorId: string,
    basePath: string
): Class<Controller> {
    class MixedController extends controllerClass {
        /**
         * Delete operations
         *
         * 1. filter
         */

        @intercept(filter(ctor, "delete", 0, "where", 0, "where"))
        // @authorize(getAccessPermission(ctor, "delete"))
        @authenticate("bearer")
        @del(`${basePath}`, {
            responses: {
                "200": {
                    description: `Delete multiple ${ctor.name} by where`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async deleteAll(where?: Where<Model>): Promise<Count> {
            return await repositoryGetter(this as any).deleteAll(where);
        }

        // @intercept(exist(ctor, 0, repositoryGetter))
        @intercept(filter(ctor, "delete", 0, ctorId as string, 1, "where"))
        // @authorize(getAccessPermission(ctor, "delete"))
        @authenticate("bearer")
        @del(`${basePath}/{id}`, {
            responses: {
                "200": {
                    description: `Delete single ${ctor.name} by id`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async deleteOne(id: string): Promise<Count> {
            return await repositoryGetter(this as any).deleteAll(arguments[1]);
        }
    }

    /** Decorate deleteAll arguments */
    param.query.object("where", getWhereSchemaFor(ctor), {
        description: `Where ${ctor.name}`
    })(MixedController.prototype, "deleteAll", 0);

    /** Decorate deleteOne arguments */
    param.path.string("id")(MixedController.prototype, "deleteOne", 0);

    return MixedController as any;
}
export function HistoryControllerMixin<Model extends Entity, Controller>(
    controllerClass: Class<ACLController>,
    repositoryGetter: RepositoryGetter<Model, Controller>,
    ctor: Ctor<Model>,
    ctorId: string,
    basePath: string
): Class<Controller> {
    class MixedController extends controllerClass {
        /**
         * History operations
         *
         * 1. filter
         */

        // @intercept(exist(ctor, 0, repositoryGetter))
        @intercept(
            filter(ctor, "history", 1, "filter", 1, "filter", {
                arg: 0,
                property: ctorId as string
            })
        )
        // @authorize(getAccessPermission(ctor, "history"))
        @authenticate("bearer")
        @get(`${basePath}/{id}/history`, {
            responses: {
                "200": {
                    description: `Get ${ctor.name} history by filter`,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: getModelSchemaRef(ctor, {
                                    includeRelations: true
                                })
                            }
                        }
                    }
                }
            }
        })
        async historyOne(id: string, filter?: Filter<Model>): Promise<Model[]> {
            return await repositoryGetter(this as any).find(filter, {
                crud: true
            });
        }
    }

    /** Decorate historyOne arguments */
    param.path.string("id")(MixedController.prototype, "historyOne", 0);
    param.query.object("filter", getFilterSchemaFor(ctor), {
        description: `Filter ${ctor.name}`
    })(MixedController.prototype, "historyOne", 1);

    return MixedController as any;
}

export function ACLControllerMixin<Model extends Entity, Controller>(
    controllerClass: Class<ACLController>,
    ctor: Ctor<Model>,
    basePath: string,
    paths: Path<Model, Controller> | any
): Class<Controller> {
    controllerClass = CreateControllerMixin(
        controllerClass,
        null as any,
        ctor,
        "",
        basePath
    );

    controllerClass = ReadControllerMixin(
        controllerClass,
        null as any,
        ctor,
        "",
        basePath
    );

    controllerClass = UpdateControllerMixin(
        controllerClass,
        null as any,
        ctor,
        "",
        basePath
    );

    controllerClass = DeleteControllerMixin(
        controllerClass,
        null as any,
        ctor,
        "",
        basePath
    );

    controllerClass = HistoryControllerMixin(
        controllerClass,
        null as any,
        ctor,
        "",
        basePath
    );

    return controllerClass as any;
}
