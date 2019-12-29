import { model } from "@loopback/repository";

import {
    UserRole as UserRoleModel,
    UserRoleRelations as UserRoleModelRelations
} from "loopback-authorization-extension";

@model({ settings: {} })
export class UserRole extends UserRoleModel {
    constructor(data?: Partial<UserRole>) {
        super(data);
    }
}

export interface UserRoleRelations extends UserRoleModelRelations {}

export type UserRoleWithRelations = UserRole & UserRoleRelations;
