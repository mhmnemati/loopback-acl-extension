import { model } from "@loopback/repository";

import {
    UserRole as UserRoleModel,
    UserRoleRelations as UserRoleModelRelations,
    relation
} from "loopback-authorization-extension";

import { access } from "../decorators";
import { ACLPermissions } from "../types";
import { User, Role } from "./";

@access<UserRoleWithRelations, ACLPermissions>({
    create: "USER_ROLES_WRITE",
    read: ["USER_ROLES_READ", (context, filter) => filter],
    update: ["USER_ROLES_WRITE", (context, filter) => filter],
    delete: ["USER_ROLES_WRITE", (context, filter) => filter],
    history: ["USER_ROLES_HISTORY", (context, filter) => filter]
})
@relation<UserRoleWithRelations, User>("user", () => User)
@relation<UserRoleWithRelations, Role>("role", () => Role)
@model({
    settings: {
        access: access
    }
})
export class UserRole extends UserRoleModel {
    constructor(data?: Partial<UserRole>) {
        super(data);
    }
}

export interface UserRoleRelations extends UserRoleModelRelations {}

export type UserRoleWithRelations = UserRole & UserRoleRelations;
