import { model } from "@loopback/repository";

import {
    Permission as PermissionModel,
    PermissionRelations as PermissionModelRelations
} from "loopback-authorization-extension";

import { relation, access } from "../decorators";
import { ACLPermissions } from "../types";
import { RolePermission } from "./";

@access<PermissionWithRelations, ACLPermissions>({
    create: "PERMISSIONS_WRITE",
    read: ["PERMISSIONS_READ", (context, filter) => filter],
    update: ["PERMISSIONS_WRITE", (context, filter) => filter],
    delete: ["PERMISSIONS_WRITE", (context, filter) => filter],
    history: ["PERMISSIONS_READ", (context, filter) => filter]
})
@relation<PermissionWithRelations, RolePermission>(
    "rolePermissions",
    () => RolePermission
)
@model({
    settings: {
        access: access
    }
})
export class Permission extends PermissionModel {
    constructor(data?: Partial<Permission>) {
        super(data);
    }
}

export interface PermissionRelations extends PermissionModelRelations {}

export type PermissionWithRelations = Permission & PermissionRelations;
