import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { HttpErrors } from "@loopback/rest";
import { Entity, Filter, RelationType } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { ACLPermissions, FilterScope, RepositoryGetter } from "../types";

import { filterFn } from "./filter.interceptor";

export function exist<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    ctor: Ctor<Model>,
    scope: FilterScope<Model, Permissions, Controller>,
    argIndexBegin: number,
    argIndexEnd: number,
    repositoryGetter: RepositoryGetter<any, Controller>,
    relations: string[]
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        /** Get ids from arguments array */
        let ids: string[] = invocationCtx.args.slice(
            argIndexBegin,
            argIndexEnd
        );

        const pathFilter = generateFilter(ctor, ids, relations);

        if (Boolean(pathFilter)) {
            const filter = await filterFn(
                ctor,
                scope,
                "read",
                pathFilter,
                invocationCtx
            );

            const id = await existFn(
                ctor,
                filter,
                repositoryGetter,
                relations,
                invocationCtx
            );

            if (!Boolean(id)) {
                throw new HttpErrors.Forbidden(
                    "You don't have required filter to access this model!"
                );
            } else {
                invocationCtx.args.push(id);
            }
        }

        return next();
    };
}

async function existFn<Model extends Entity, Controller>(
    ctor: Ctor<Model>,
    filter: Filter<Model>,
    repositoryGetter: RepositoryGetter<any, Controller>,
    relations: string[],
    invocationCtx: InvocationContext
): Promise<string | undefined> {
    const model = await repositoryGetter(invocationCtx.target as any).findOne(
        filter
    );

    const lastModel = relations.reduce((accumulate, relation) => {
        if (!Boolean(accumulate)) {
            return undefined;
        }

        const modelRelation = ctor.definition.relations[relation];

        ctor = modelRelation.target();

        if (modelRelation.type === RelationType.hasMany) {
            return accumulate[relation][0];
        } else {
            return accumulate[relation];
        }
    }, model);

    if (lastModel) {
        const lastModelIdProperty = ctor.getIdProperties()[
            ctor.getIdProperties().length - 1
        ];

        return lastModel[lastModelIdProperty];
    }
}

export function generatePath<Model extends Entity>(
    ctor: Ctor<Model>,
    relations: string[],
    basePath: string
): string {
    let lastRelationTypes: RelationType[] = [RelationType.hasMany];

    return relations.reduce((accumulate, relation, index) => {
        const modelRelation = ctor.definition.relations[relation];
        const modelIdName = `${ctor.name.toLowerCase()}_id`;
        const modelRelationName = `${relation.toLowerCase()}`;

        lastRelationTypes = [modelRelation.type, ...lastRelationTypes];

        ctor = modelRelation.target();

        if (lastRelationTypes.pop() === RelationType.hasMany) {
            return `${accumulate}/{${modelIdName}}/${modelRelationName}`;
        } else {
            return `${accumulate}/${modelRelationName}`;
        }
    }, `${basePath}/${ctor.name.toLowerCase()}s`);
}

export function generateFilter<Model extends Entity>(
    ctor: Ctor<Model>,
    ids: string[],
    relations: string[]
): Filter<Model> | undefined {
    let filter: Filter<any> = {};
    let idIndex = 0;

    let lastRelationTypes: RelationType[] = [RelationType.hasMany];

    relations.reduce((accumulate, relation, index) => {
        const modelRelation = ctor.definition.relations[relation];
        const modelIdProperty = ctor.getIdProperties()[
            ctor.getIdProperties().length - 1
        ];

        lastRelationTypes = [modelRelation.type, ...lastRelationTypes];

        ctor = modelRelation.target();

        if (lastRelationTypes.pop() === RelationType.hasMany) {
            accumulate.where = {
                [modelIdProperty]: ids[idIndex++] || ""
            };
        }

        if (
            index < relations.length - 1 ||
            modelRelation.type !== RelationType.hasMany
        ) {
            accumulate.include = [
                {
                    relation: relation,
                    scope: {}
                }
            ];

            return accumulate.include[0].scope as any;
        }
    }, filter);

    return filter;
}
