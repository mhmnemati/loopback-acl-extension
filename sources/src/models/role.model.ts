import { model, property, belongsTo, hasMany } from "@loopback/repository";

import {
    Role as RoleModel,
    RoleRelations as RoleModelRelations
} from "loopback-authorization-extension";

import { ModelAccess } from "../types";

import {
    UserRole,
    UserRoleWithRelations,
    RolePermission,
    RolePermissionWithRelations
} from "./";

const access: ModelAccess<Role> = {
    create: {
        permission: "ROLES_WRITE"
    },
    read: {
        permission: "ROLES_READ",
        filter: (context, filter) => filter
    },
    update: {
        permission: "ROLES_WRITE",
        filter: (context, filter) => filter
    },
    delete: {
        permission: "ROLES_WRITE",
        filter: (context, filter) => filter
    },
    history: {
        permission: "ROLES_HISTORY",
        filter: (context, filter) => filter
    }
};

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

    /**
     * Begin relation overrides using models with access
     */
    @belongsTo(() => Role, { keyFrom: "parentId", keyTo: "id" })
    parentId: string;

    @hasMany(() => Role, { keyFrom: "id", keyTo: "parentId" } as any)
    childs: RoleWithRelations[];

    @hasMany(() => UserRole, { keyFrom: "id", keyTo: "roleId" } as any)
    userRoles: UserRoleWithRelations[];

    @hasMany(() => RolePermission, { keyFrom: "id", keyTo: "roleId" } as any)
    rolePermissions: RolePermissionWithRelations[];
    /**
     * End relation overrides using models with access
     */

    constructor(data?: Partial<Role>) {
        super(data);
    }
}

export interface RoleRelations extends RoleModelRelations {}

export type RoleWithRelations = Role & RoleRelations;
