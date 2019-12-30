import { model } from "@loopback/repository";

import {
    RolePermission as RolePermissionModel,
    RolePermissionRelations as RolePermissionModelRelations
} from "loopback-authorization-extension";

@model({ settings: {} })
export class RolePermission extends RolePermissionModel {
    constructor(data?: Partial<RolePermission>) {
        super(data);
    }
}

export interface RolePermissionRelations extends RolePermissionModelRelations {}

export type RolePermissionWithRelations = RolePermission &
    RolePermissionRelations;
