import { model } from "@loopback/repository";

import {
    relation,
    RolePermission as RolePermissionModel,
    RolePermissionRelations as RolePermissionModelRelations
} from "loopback-authorization-extension";

import { access } from "../decorators";
import { ACLPermissions } from "../types";
import { Role, Permission } from "./";

@access<RolePermissionWithRelations, ACLPermissions>({
    create: "ROLE_PERMISSIONS_WRITE",
    read: ["ROLE_PERMISSIONS_READ", async (context, filter) => filter],
    update: ["ROLE_PERMISSIONS_WRITE", async (context, filter) => filter],
    delete: ["ROLE_PERMISSIONS_WRITE", async (context, filter) => filter],
    history: ["ROLE_PERMISSIONS_HISTORY", async (context, filter) => filter]
})
@relation<RolePermissionWithRelations, Role>("role", () => Role)
@relation<RolePermissionWithRelations, Permission>(
    "permission",
    () => Permission
)
@model({
    settings: {
        access: access
    }
})
export class RolePermission extends RolePermissionModel {
    constructor(data?: Partial<RolePermission>) {
        super(data);
    }
}

export interface RolePermissionRelations extends RolePermissionModelRelations {}

export type RolePermissionWithRelations = RolePermission &
    RolePermissionRelations;
