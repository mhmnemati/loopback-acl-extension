import { model, property } from "@loopback/repository";

import {
    Role as RoleModel,
    RoleRelations as RoleModelRelations
} from "loopback-authorization-extension";

import { relation, access } from "../decorators";
import { ACLPermissions } from "../types";
import { UserRole, RolePermission } from "./";

@access<RoleWithRelations, ACLPermissions>({
    create: "ROLES_WRITE",
    read: ["ROLES_READ", (context, filter) => filter],
    update: ["ROLES_WRITE", (context, filter) => filter],
    delete: ["ROLES_WRITE", (context, filter) => filter],
    history: ["ROLES_HISTORY", (context, filter) => filter]
})
@relation<RoleWithRelations, Role>("parent", () => Role)
@relation<RoleWithRelations, Role>("childs", () => Role)
@relation<RoleWithRelations, UserRole>("userRoles", () => UserRole)
@relation<RoleWithRelations, RolePermission>(
    "rolePermissions",
    () => RolePermission
)
@model({
    settings: {
        access: access
    }
})
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
