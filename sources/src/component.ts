import { Component, ProviderMap } from "@loopback/core";
import { Entity } from "@loopback/repository";

import {
    injectUserModel,
    injectGroupModel,
    injectRoleModel,
    injectPermissionModel,
    injectSessionModel,
    injectCodeModel
} from "@acl/keys";
import { User, Group, Role, Permission, Session, Code } from "@acl/models";

import { GenerateUsersController } from "@acl/servers/rest/controllers";

export class ACLComponent implements Component {
    constructor(
        @injectUserModel()
        userModel: typeof Entity & { prototype: User }
    ) {
        this.controllers = [GenerateUsersController(userModel)] as any;
    }
    providers?: ProviderMap = {};
    controllers = [];
}
