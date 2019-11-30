import { Entity, DefaultCrudRepository, Filter } from "@loopback/repository";
import { Controller } from "@acl/servers/rest/controller";
import { InvocationContext } from "@loopback/context";

/** Get Repository From Controller */
export type RepositoryGetter<Model extends Entity> = (
    controller: Controller
) => DefaultCrudRepository<Model, any, any>;

/** Get Model Ctor From Controller */
export type ModelGetter<Model extends Entity> = (
    controller: Controller
) => typeof Entity & { prototype: Model };

/** Filter Handler */
export type FilterMethod<Model extends Entity> = (
    context: InvocationContext,
    filter: Filter<Model>
) => Filter<Model>;
