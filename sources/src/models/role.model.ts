import { model, property } from "@loopback/repository";

import {
    Role as RoleModel,
    RoleRelations as RoleModelRelations
} from "loopback-authorization-extension";

@model({ settings: {} })
export class Role extends RoleModel {
    @property({
        type: "string"
    })
    name: string;

    @property({
        type: "string"
    })
    description: string;

    constructor(data?: Partial<Role>) {
        super(data);
    }
}

export interface RoleRelations extends RoleModelRelations {}

export type RoleWithRelations = Role & RoleRelations;
