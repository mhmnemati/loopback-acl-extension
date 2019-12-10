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
import { filter } from "~/interceptors";
import { ACLPermissions, RepositoryGetter, FilterMethod } from "~/types";

export function ACLRelationControllerMixin<
    Model extends Entity,
    MemberModel extends Entity
>(
    ctor: Ctor<Model>,
    memberCtor: Ctor<MemberModel>,
    ctorContainerId: keyof Model,
    memberCtorId: keyof MemberModel,
    basePath: string,
    repositoryGetter: RepositoryGetter<Model>,
    modelGetter: (id: string, memberId: string) => Model,
    whereGetter: (id: string, memberId: string) => Where<Model>,
    accessControl: {
        read: {
            permission: Condition<ACLPermissions>;
            filter: FilterMethod<Model>;
        };
        add: {
            permission: Condition<ACLPermissions>;
        };
        remove: {
            permission: Condition<ACLPermissions>;
        };
        history: {
            permission: Condition<ACLPermissions>;
            filter: FilterMethod<Model>;
        };
    }
): Class<ACLController> {
    class RelationController extends ACLController {
        @intercept(
            filter(1, "filter", accessControl.read.filter, 1, "filter", {
                arg: 0,
                property: ctorContainerId as string
            })
        )
        @authorize<ACLPermissions>(accessControl.read.permission)
        @authenticate("bearer")
        @get(`${basePath}`, {
            responses: {
                "200": {
                    description: `Get ${ctor.name} members by filter`,
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
            @param.path.string("id") id: string,
            @param.query.object("filter", getFilterSchemaFor(ctor), {
                description: `Filter ${ctor.name}`
            })
            filter?: Filter<Model>
        ): Promise<Model[]> {
            return await repositoryGetter(this).find(filter);
        }

        @intercept(
            filter(1, "where", accessControl.read.filter, 1, "where", {
                arg: 0,
                property: ctorContainerId as string
            })
        )
        @authorize<ACLPermissions>(accessControl.read.permission)
        @authenticate("bearer")
        @get(`${basePath}/count`, {
            responses: {
                "200": {
                    description: `Get ${ctor.name} members count by where`,
                    content: {
                        "application/json": {
                            schema: CountSchema
                        }
                    }
                }
            }
        })
        async count(
            @param.path.string("id") id: string,
            @param.query.object("where", getWhereSchemaFor(ctor), {
                description: `Where ${ctor.name}`
            })
            where?: Where<Model>
        ): Promise<Count> {
            return await repositoryGetter(this).count(where);
        }

        @authorize<ACLPermissions>(accessControl.add.permission)
        @authenticate("bearer")
        @post(`${basePath}`, {
            responses: {
                "204": {
                    description: `Add ${memberCtor.name} member to ${ctor.name}`
                }
            }
        })
        async add(
            @param.path.string("id") id: string,
            @requestBody({
                content: {
                    "application/json": {
                        schema: getModelSchemaRef(memberCtor, {
                            exclude: Object.keys(
                                memberCtor.definition.properties
                            ).filter(key => key !== memberCtorId) as any
                        })
                    }
                }
            })
            memberModel: MemberModel
        ): Promise<Model> {
            return await repositoryGetter(this).create(
                modelGetter(id, (memberModel as any)[memberCtorId])
            );
        }

        @authorize<ACLPermissions>(accessControl.remove.permission)
        @authenticate("bearer")
        @del(`${basePath}`, {
            responses: {
                "204": {
                    description: `Remove ${memberCtor.name} member from ${ctor.name}`
                }
            }
        })
        async remove(
            @param.path.string("id") id: string,
            @requestBody({
                content: {
                    "application/json": {
                        schema: getModelSchemaRef(memberCtor, {
                            exclude: Object.keys(
                                memberCtor.definition.properties
                            ).filter(key => key !== memberCtorId) as any
                        })
                    }
                }
            })
            memberModel: MemberModel
        ) {
            return await repositoryGetter(this).deleteAll(
                whereGetter(id, (memberModel as any)[memberCtorId])
            );
        }

        @intercept(
            filter(1, "filter", accessControl.history.filter, 1, "filter", {
                arg: 0,
                property: ctorContainerId as string
            })
        )
        @authorize<ACLPermissions>(accessControl.history.permission)
        @authenticate("bearer")
        @get(`${basePath}/history`, {
            responses: {
                "200": {
                    description: `Get ${ctor.name} members history by filter`,
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
        async history(
            @param.path.string("id") id: string,
            @param.query.object("filter", getFilterSchemaFor(ctor), {
                description: `Filter ${ctor.name}`
            })
            filter?: Filter<Model>
        ): Promise<Model[]> {
            return await repositoryGetter(this).find(filter, { crud: true });
        }
    }

    return RelationController;
}
