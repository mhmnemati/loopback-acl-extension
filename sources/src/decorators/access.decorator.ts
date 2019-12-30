import { Entity } from "@loopback/repository";
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

export function getAccessPermission<Permissions extends ACLPermissions>(
    model: Function & { definition?: any },
    access: "create" | "read" | "update" | "delete" | "history"
): Condition<Permissions> {
    if (access === "create") {
        return model.definition.access[access];
    }

    return model.definition.access[access][0];
}

export function getAccessFilter<Model extends Entity>(
    model: Function & { definition?: any },
    access: "read" | "update" | "delete" | "history"
): FilterMethod<Model> {
    return model.definition.access[access][1];
}
