import { model, property } from "@loopback/repository";
import {
    Group as GroupModel,
    GroupRelations as GroupModelRelations
} from "loopback-authorization-extension";

@model({ settings: {} })
export class Group extends GroupModel {
    @property({
        type: "string"
    })
    title: string;

    @property({
        type: "string"
    })
    description: string;

    @property({
        type: "string"
    })
    picture: string;

    @property({
        type: "string",
        required: true
    })
    status: "Active" | "Disable";

    constructor(data?: Partial<Group>) {
        super(data);
    }
}

export interface GroupRelations extends GroupModelRelations {}

export type GroupWithRelations = Group & GroupRelations;
