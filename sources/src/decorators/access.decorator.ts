import { Entity } from "@loopback/repository";
import { Ctor } from "loopback-history-extension";
import { Condition } from "loopback-authorization-extension";

import { ACLPermissions, FilterMethod } from "../types";

export function access<
    Model extends Entity,
    Permissions extends ACLPermissions
>(access: {
    create?: Condition<Permissions>;
    read?: [Condition<Permissions>, FilterMethod<Model>];
    update?: [Condition<Permissions>, FilterMethod<Model>];
    delete?: [Condition<Permissions>, FilterMethod<Model>];
    history?: [Condition<Permissions>, FilterMethod<Model>];
}) {
    return function(model: Function & { definition?: any }) {
        model.definition.access = {
            ...model.definition.access,
            ...access
        };
    };
}

export function getAccessPermission<
    Model extends Entity,
    Permissions extends ACLPermissions
>(
    ctor: Ctor<Model>,
    access: "create" | "read" | "update" | "delete" | "history"
): Condition<Permissions> {
    if (access === "create") {
        return ctor.definition.access[access];
    }

    return ctor.definition.access[access][0];
}

export function getAccessFilter<Model extends Entity>(
    ctor: Ctor<Model>,
    access: "read" | "update" | "delete" | "history"
): FilterMethod<Model> {
    if (ctor.definition.access && ctor.definition.access[access]) {
        return ctor.definition.access[access][1];
    }

    return (context, filter) => filter;
}

export function getAccessTarget<Model extends Entity>(
    ctor: Ctor<Model>,
    relation: string
): Ctor<Model> | undefined {
    if (ctor.definition.relations && ctor.definition.relations[relation]) {
        return ctor.definition.relations[relation].target();
    }

    return undefined;
}
