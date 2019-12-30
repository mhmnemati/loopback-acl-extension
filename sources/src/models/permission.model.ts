import { model } from "@loopback/repository";

import {
    Permission as PermissionModel,
    PermissionRelations as PermissionModelRelations
} from "loopback-authorization-extension";

import { ModelAccess } from "../types";

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
    constructor(data?: Partial<Permission>) {
        super(data);
    }
}

export interface PermissionRelations extends PermissionModelRelations {}

export type PermissionWithRelations = Permission & PermissionRelations;
