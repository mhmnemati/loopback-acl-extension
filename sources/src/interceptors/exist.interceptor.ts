import {
    Interceptor,
    InvocationContext,
    InvocationResult,
    ValueOrPromise
} from "@loopback/context";
import { HttpErrors } from "@loopback/rest";
import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";

import { RepositoryGetter } from "../types";

export function exist<Model extends Entity, Controller>(
    ctor: Ctor<Model>,
    argIndexBegin: number,
    argIndexEnd: number,
    repositoryGetter: RepositoryGetter<any, Controller>,
    withoutUnqiue: boolean
): Interceptor {
    return async (
        invocationCtx: InvocationContext,
        next: () => ValueOrPromise<InvocationResult>
    ) => {
        /** Get model from arguments request body */
        let models: any[] = invocationCtx.args[argIndex];
        if (!Array.isArray(models)) {
            models = [models];
        }

        if (
            !(await uniqueFn(
                ctor,
                models,
                repositoryGetter,
                withoutUnqiue,
                invocationCtx
            ))
        ) {
            throw new HttpErrors.Conflict(
                `Conflict with unique fields: ${getUniqueFields(ctor, models)}`
            );
        }

        return next();
    };
}

async function existFn<Model extends Entity, Controller>(
    ctor: Ctor<Model>,
    models: Model[],
    repositoryGetter: RepositoryGetter<any, Controller>,
    withoutUnqiue: boolean,
    invocationCtx: InvocationContext
): Promise<boolean> {
    /** Get repository */
    const repository = repositoryGetter(invocationCtx.target as any);

    /** Find unique fields of model ctor */
    const uniqueFields = getUniqueFields<Model>(ctor, models);

    let count = { count: 0 };

    /** Check for without unique, when using updateAll */
    if (withoutUnqiue) {
        /** Find count of models unique fields */
        count = {
            count: models
                .map(
                    model =>
                        Object.keys(model).filter(
                            modelKey => uniqueFields.indexOf(modelKey) >= 0
                        ).length
                )
                .reduce((prev, current) => prev + current, 0)
        };
    } else if (uniqueFields.length > 0) {
        /** Find count of models where unique field values are same */
        count = await repository.count({
            or: uniqueFields.map(fieldName => ({
                [fieldName]: {
                    inq: models
                        .map((model: any) => model[fieldName])
                        .filter(fieldValue => Boolean(fieldValue))
                }
            }))
        });
    }

    return count.count <= 0;
}

function getPathFilter<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    paths: Path<Model, Permissions, Controller>[],
    ids: string[]
): Filter<Model> | undefined {
    let filter: Filter<Model> = {};

    let idIndex = 0;
    paths.reduce((accumulate, path, index) => {
        const idName = getIdNameByPath(path);
        const idProperty = getIdPropertyByPath(path);

        /**
         * If last path relation is () or (hasMany) don't use it,
         * we want parent related id
         *
         * If last path is (belongsTo) or (hasOne) use it,
         * we want model id
         * */
        if (index === paths.length - 1 && idName) {
            return accumulate;
        }

        if (idName) {
            accumulate.include = [
                {
                    relation: path.relation?.name || "",
                    scope: {
                        where: {
                            [idProperty]: ids[idIndex++] || ""
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
        return filter.include[0].scope as any;
    }
}

async function getPathIdValue<
    Model extends Entity,
    Permissions extends ACLPermissions,
    Controller
>(
    paths: Path<Model, Permissions, Controller>[],
    ids: string[],
    invocationCtx: InvocationContext
): Promise<string | undefined> {
    const pathFilter = getPathFilter(paths, ids);

    if (!pathFilter) {
        return undefined;
    }

    const filter = await filterFn<any, Permissions, Controller>(
        paths[0].ctor,
        paths[0].scope,
        "read",
        pathFilter,
        invocationCtx
    );

    const model = await paths[0].scope
        .repositoryGetter(invocationCtx.target as any)
        .findOne(filter);

    return (
        paths.reduce((accumulate, path, index) => {
            if (!Boolean(accumulate)) {
                return undefined;
            }

            if (path.relation) {
                accumulate = accumulate[path.relation.name] || [];

                if (path.relation.type === RelationType.hasMany) {
                    accumulate = accumulate[0] || {};
                }
            }

            if (index === paths.length) {
                return accumulate[getIdPropertyByPath(path)];
            } else {
                return accumulate;
            }
        }, model) || ""
    );
}
