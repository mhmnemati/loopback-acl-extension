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
import { exist, filter, unique } from "../../interceptors";
import { RepositoryGetter } from "../../types";

import { getAccessPermission } from "../../decorators";

export function ACLCRUDControllerMixin<
    Controller extends ACLController,
    Model extends Entity
>(
    controllerClass: Class<ACLController>,
    ctor: Ctor<Model>,
    ctorId: keyof Model,
    basePath: string,
    repositoryGetter: RepositoryGetter<Controller, Model>
): Class<Controller> {
    class CRUDController extends controllerClass {
        /** Create operations */
        @intercept(unique(ctor, 0, "multiple", false, repositoryGetter))
        @authorize(getAccessPermission(ctor, "create"))
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
        async createAll(
            @requestBody({
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: getModelSchemaRef(ctor, {
                                exclude: [
                                    "uid",
                                    "beginDate",
                                    "endDate",
                                    "id"
                                ] as any
                            })
                        }
                    }
                }
            })
            models: Model[]
        ): Promise<Model[]> {
            return await repositoryGetter(this as any).createAll(models);
        }

        @intercept(unique(ctor, 0, "single", false, repositoryGetter))
        @authorize(getAccessPermission(ctor, "create"))
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
        async createOne(
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
            return await repositoryGetter(this as any).create(model);
        }

        /** Read operations */
        @intercept(filter(ctor, "read", 0, "filter", 0, "filter"))
        @authorize(getAccessPermission(ctor, "read"))
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
        async readAll(
            @param.query.object("filter", getFilterSchemaFor(ctor), {
                description: `Filter ${ctor.name}`
            })
            filter?: Filter<Model>
        ): Promise<Model[]> {
            return await repositoryGetter(this as any).find(filter);
        }

        @intercept(filter(ctor, "read", 0, "where", 0, "where"))
        @authorize(getAccessPermission(ctor, "read"))
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
        async countAll(
            @param.query.object("where", getWhereSchemaFor(ctor), {
                description: `Where ${ctor.name}`
            })
            where?: Where<Model>
        ): Promise<Count> {
            return await repositoryGetter(this as any).count(where);
        }

        @intercept(exist(0, repositoryGetter))
        @intercept(filter(ctor, "read", 0, ctorId as string, 1, "filter"))
        @authorize(getAccessPermission(ctor, "read"))
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
        async readOne(@param.path.string("id") id: string): Promise<Model> {
            return await repositoryGetter(this as any).findOne(arguments[1]);
        }

        /** Update operations */
        @intercept(unique(ctor, 0, "single", true, repositoryGetter))
        @intercept(filter(ctor, "update", 1, "where", 1, "where"))
        @authorize(getAccessPermission(ctor, "update"))
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
        ): Promise<Model[]> {
            await repositoryGetter(this as any).updateAll(model, where);

            return await repositoryGetter(this as any).find({ where: where });
        }

        @intercept(unique(ctor, 0, "single", false, repositoryGetter))
        @intercept(exist(1, repositoryGetter))
        @intercept(filter(ctor, "update", 1, ctorId as string, 2, "where"))
        @authorize(getAccessPermission(ctor, "update"))
        @authenticate("bearer")
        @put(`${basePath}/{id}`, {
            responses: {
                "200": {
                    description: `Update single ${ctor.name} by id`,
                    schema: getModelSchemaRef(ctor)
                }
            }
        })
        async updateOne(
            @requestBody({
                content: {
                    "application/json": {
                        schema: getModelSchemaRef(ctor, { partial: true })
                    }
                }
            })
            model: Model,
            @param.path.string("id") id: string
        ): Promise<Model> {
            await repositoryGetter(this as any).updateAll(model, arguments[2]);

            return await repositoryGetter(this as any).findById(id);
        }

        /** Delete operations */
        @intercept(filter(ctor, "delete", 0, "where", 0, "where"))
        @authorize(getAccessPermission(ctor, "delete"))
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
        async deleteAll(
            @param.query.object("where", getWhereSchemaFor(ctor), {
                description: `Where ${ctor.name}`
            })
            where?: Where<Model>
        ): Promise<Count> {
            return await repositoryGetter(this as any).deleteAll(where);
        }

        @intercept(exist(0, repositoryGetter))
        @intercept(filter(ctor, "delete", 0, ctorId as string, 1, "where"))
        @authorize(getAccessPermission(ctor, "delete"))
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
        async deleteOne(@param.path.string("id") id: string): Promise<Count> {
            return await repositoryGetter(this as any).deleteAll(arguments[1]);
        }

        /** History operations */
        @intercept(exist(0, repositoryGetter))
        @intercept(
            filter(ctor, "history", 1, "filter", 1, "filter", {
                arg: 0,
                property: ctorId as string
            })
        )
        @authorize(getAccessPermission(ctor, "history"))
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
        async historyOne(
            @param.path.string("id") id: string,
            @param.query.object("filter", getFilterSchemaFor(ctor), {
                description: `Filter ${ctor.name}`
            })
            filter?: Filter<Model>
        ): Promise<Model[]> {
            return await repositoryGetter(this as any).find(filter, {
                crud: true
            });
        }
    }

    return CRUDController as any;
}
