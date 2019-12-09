import { ACLController } from "~/servers";
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
import { exist, filter, unique } from "~/interceptors";
import { ACLPermissions, RepositoryGetter, FilterMethod } from "~/types";

export function ACLCRUDControllerMixin<Model extends Entity>(
    ctor: Ctor<Model>,
    basePath: string,
    repositoryGetter: RepositoryGetter<Model>,
    userPermission: {
        create: Condition<ACLPermissions>;
        read: Condition<ACLPermissions>;
        update: Condition<ACLPermissions>;
        delete: Condition<ACLPermissions>;
        history: Condition<ACLPermissions>;
    },
    filterMethod: FilterMethod<Model>
): Class<ACLController> {
    class CRUDController extends ACLController {
        @intercept(unique<Model>(repositoryGetter, ctor, 0))
        @authorize<ACLPermissions>(userPermission.create)
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

        @intercept(filter(0, "where", "where", filterMethod))
        @authorize<ACLPermissions>(userPermission.read)
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

        @intercept(filter(0, "filter", "filter", filterMethod))
        @authorize<ACLPermissions>(userPermission.read)
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

        @intercept(unique<Model>(repositoryGetter, ctor, 0))
        @intercept(filter(0, "where", "where", filterMethod))
        @authorize<ACLPermissions>(userPermission.update)
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

        @intercept(filter(0, "where", "where", filterMethod))
        @authorize<ACLPermissions>(userPermission.delete)
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

        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(userPermission.read)
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
            return await repositoryGetter(this).findById(id);
        }

        @intercept(unique<Model>(repositoryGetter, ctor, 1))
        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(userPermission.update)
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
            await repositoryGetter(this).updateById(id, model);
        }

        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(userPermission.delete)
        @authenticate("bearer")
        @del(`${basePath}/{id}`, {
            responses: {
                "204": {
                    description: `Delete ${ctor.name} by id`
                }
            }
        })
        async deleteById(@param.path.string("id") id: string): Promise<void> {
            await repositoryGetter(this).deleteById(id);
        }

        @intercept(filter(0, "filter", "filter", filterMethod))
        @intercept(exist(repositoryGetter))
        @authorize<ACLPermissions>(userPermission.history)
        @authenticate("bearer")
        @get(`${basePath}/{id}/history`, {
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
        async historyById(
            @param.path.string("id") id: string,
            @param.query.object("filter", getFilterSchemaFor(ctor), {
                description: `Filter ${ctor.name}`
            })
            filter?: Filter<Model>
        ): Promise<Model[]> {
            return await repositoryGetter(this).find(filter, {});
        }
    }

    return CRUDController;
}
