import { model, hasMany } from "@loopback/repository";

import {
    Permission as PermissionModel,
    PermissionRelations as PermissionModelRelations
} from "loopback-authorization-extension";

import { ModelAccess } from "../types";

import { RolePermission, RolePermissionWithRelations } from "./";

const access: ModelAccess<Permission> = {
    create: {
        permission: "PERMISSIONS_WRITE"
    },
    read: {
        permission: "PERMISSIONS_READ",
        filter: (context, filter) => filter
    },
    update: {
        permission: "PERMISSIONS_WRITE",
        filter: (context, filter) => filter
    },
    delete: {
        permission: "PERMISSIONS_WRITE",
        filter: (context, filter) => filter
    },
    history: {
        permission: "PERMISSIONS_READ",
        filter: (context, filter) => filter
    }
};

@model({
    settings: {
        access: access
    }
})
export class Permission extends PermissionModel {
    /**
     * Begin relation overrides using models with access
     */
    @hasMany(() => RolePermission, {
        keyFrom: "id",
        keyTo: "permissionId"
    } as any)
    rolePermissions: RolePermissionWithRelations[];
    /**
     * End relation overrides using models with access
     */

    constructor(data?: Partial<Permission>) {
        super(data);
    }
}

export interface PermissionRelations extends PermissionModelRelations {}

export type PermissionWithRelations = Permission & PermissionRelations;
