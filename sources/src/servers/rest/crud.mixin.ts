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
    patch,
    put,
    del,
    param,
    requestBody,
    getModelSchemaRef,
    getWhereSchemaFor,
    getFilterSchemaFor
} from "@loopback/rest";
import { Ctor } from "loopback-history-extension";
// import { getFilterSchemaFor } from "~/servers";

import { authenticate } from "@loopback/authentication";
import { authorize, Condition } from "loopback-authorization-extension";
import { intercept } from "@loopback/core";
import { exist, filter, unique } from "../../interceptors";
import { ACLPermissions, RepositoryGetter, FilterMethod } from "../../types";

export function ACLCRUDControllerMixin<
    Model extends Entity,
    Controller extends ACLController
>(
    controller: Class<Controller>,
    ctor: Ctor<Model>,
    ctorId: keyof Model,
    basePath: string,
    repositoryGetter: RepositoryGetter<Model>,
    accessControl: {
        create: {
            permission: Condition<ACLPermissions>;
        };
        read: {
            permission: Condition<ACLPermissions>;
            filter: FilterMethod<Model>;
        };
        update: {
            permission: Condition<ACLPermissions>;
            filter: FilterMethod<Model>;
        };
        delete: {
            permission: Condition<ACLPermissions>;
            filter: FilterMethod<Model>;
        };
        history: {
            permission: Condition<ACLPermissions>;
            filter: FilterMethod<Model>;
        };
    }
): Class<Controller> {
    class CRUDController extends controller {
        @intercept(unique<Model>(repositoryGetter, ctor, 0))
        @authorize<ACLPermissions>(accessControl.create.permission)
        @authenticate("bearer")
        @post(`${basePath}`, {
            responses: {
                "200": {
                    description: `Create ${ctor.name}`,
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
        async create(
            @requestBody({
                content: {
                    "application/json": {
                        schema: getModelSchemaRef(ctor, {
                            exclude: [
                                "uid",
                                "beginDate",
                                "endDate",
                                "id"
                            ] as any
                        })
                    }
                }
            })
            model: Model
        ): Promise<Model> {
            return await repositoryGetter(this).create(model);
        }

        @intercept(filter(0, "where", accessControl.read.filter, 0, "where"))
        @authorize<ACLPermissions>(accessControl.read.permission)
        @authenticate("bearer")
        @get(`${basePath}/count`, {
            responses: {
                "200": {
                    description: `Get ${ctor.name} count by where`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async count(
            @param.query.object("where", getWhereSchemaFor(ctor), {
                description: `Where ${ctor.name}`
            })
            where?: Where<Model>
        ): Promise<Count> {
            return await repositoryGetter(this).count(where);
        }

        @intercept(filter(0, "filter", accessControl.read.filter, 0, "filter"))
        @authorize<ACLPermissions>(accessControl.read.permission)
        @authenticate("bearer")
        @get(`${basePath}`, {
            responses: {
                "200": {
                    description: `Get ${ctor.name} by filter`,
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
        async find(
            @param.query.object("filter", getFilterSchemaFor(ctor), {
                description: `Filter ${ctor.name}`
            })
            filter?: Filter<Model>
        ): Promise<Model[]> {
            return await repositoryGetter(this).find(filter);
        }

        @intercept(filter(1, "where", accessControl.update.filter, 1, "where"))
        @intercept(unique<Model>(repositoryGetter, ctor, 0))
        @authorize<ACLPermissions>(accessControl.update.permission)
        @authenticate("bearer")
        @patch(`${basePath}`, {
            responses: {
                "200": {
                    description: `Update ${ctor.name} by where`,
                    content: { "application/json": { schema: CountSchema } }
                }
            }
        })
        async updateAll(
            @requestBody({
                content: {
                    "application/json": {
                        schema: getModelSchemaRef(ctor, { partial: true })
                    }
                }
            })
            model: Model,
            @param.query.object("where", getWhereSchemaFor(ctor), {
                description: `Where ${ctor.name}`
            })
            where?: Where<Model>
        ): Promise<Count> {
            return await repositoryGetter(this).updateAll(model, where);
        }

        @intercept(filter(0, "where", accessControl.delete.filter, 0, "where"))
        @authorize<ACLPermissions>(accessControl.delete.permission)
        @authenticate("bearer")
        @del(`${basePath}`, {
            responses: {
                "200": {
                    description: `Delete ${ctor.name} by where`,
                    content: { "application/json": { schema: CountSchema } }
                }
            }
        })
        async deleteAll(
            @param.query.object("where", getWhereSchemaFor(ctor), {
                description: `Where ${ctor.name}`
            })
            where?: Where<Model>
        ) {
            return await repositoryGetter(this).deleteAll(where);
        }

        @intercept(
            filter(0, ctorId as string, accessControl.read.filter, 1, "filter")
        )
        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(accessControl.read.permission)
        @authenticate("bearer")
        @get(`${basePath}/{id}`, {
            responses: {
                "200": {
                    description: `Get ${ctor.name} by id`,
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
        async findById(@param.path.string("id") id: string): Promise<Model> {
            return await repositoryGetter(this).findOne(arguments[1]);
        }

        @intercept(
            filter(0, ctorId as string, accessControl.update.filter, 2, "where")
        )
        @intercept(unique<Model>(repositoryGetter, ctor, 1))
        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(accessControl.update.permission)
        @authenticate("bearer")
        @put(`${basePath}/{id}`, {
            responses: {
                "204": {
                    description: `Update ${ctor.name} by id`
                }
            }
        })
        async updateById(
            @param.path.string("id") id: string,
            @requestBody({
                content: {
                    "application/json": {
                        schema: getModelSchemaRef(ctor, { partial: true })
                    }
                }
            })
            model: Model
        ): Promise<void> {
            await repositoryGetter(this).updateAll(model, arguments[2]);
        }

        @intercept(
            filter(0, ctorId as string, accessControl.delete.filter, 1, "where")
        )
        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(accessControl.delete.permission)
        @authenticate("bearer")
        @del(`${basePath}/{id}`, {
            responses: {
                "204": {
                    description: `Delete ${ctor.name} by id`
                }
            }
        })
        async deleteById(@param.path.string("id") id: string): Promise<void> {
            await repositoryGetter(this).deleteAll(arguments[1]);
        }

        @intercept(
            filter(1, "filter", accessControl.history.filter, 1, "filter", {
                arg: 0,
                property: ctorId as string
            })
        )
        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(accessControl.history.permission)
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
        async historyById(
            @param.path.string("id") id: string,
            @param.query.object("filter", getFilterSchemaFor(ctor), {
                description: `Filter ${ctor.name}`
            })
            filter?: Filter<Model>
        ): Promise<Model[]> {
            return await repositoryGetter(this).find(filter, { crud: true });
        }
    }

    return CRUDController;
}
