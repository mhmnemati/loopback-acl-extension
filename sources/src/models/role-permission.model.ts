import { model } from "@loopback/repository";

import {
    RolePermission as RolePermissionModel,
    RolePermissionRelations as RolePermissionModelRelations
} from "loopback-authorization-extension";

import { ModelAccess } from "../types";

const access: ModelAccess<RolePermission> = {
    create: {
        permission: "ROLE_PERMISSIONS_WRITE"
    },
    read: {
        permission: "ROLE_PERMISSIONS_READ",
        filter: (context, filter) => filter
    },
    update: {
        permission: "ROLE_PERMISSIONS_WRITE",
        filter: (context, filter) => filter
    },
    delete: {
        permission: "ROLE_PERMISSIONS_WRITE",
        filter: (context, filter) => filter
    },
    history: {
        permission: "ROLE_PERMISSIONS_HISTORY",
        filter: (context, filter) => filter
    }
};

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
