import { model, property } from "@loopback/repository";
import {
    User as UserModel,
    UserRelations as UserModelRelations
} from "loopback-authorization-extension";

@model({
    settings: {
        hiddenProperties: ["password"]
    }
})
export class User extends UserModel {
    @property({
        type: "string",
        required: true,
        unique: true
    })
    username: string;

    @property({
        type: "string",
        required: true
    })
    password: string;

    @property({
        type: "string",
        required: true,
        unique: true
    })
    email: string;

    @property({
        type: "string"
    })
    firstName: string;

    @property({
        type: "string"
    })
    lastName: string;

    @property({
        type: "string"
    })
    description: string;

    @property({
        type: "string"
    })
    picture: string;

    @property({
        type: "string"
    })
    country: string;

    @property({
        type: "string"
    })
    city: string;

    @property({
        type: "string"
    })
    location: string;

    @property({
        type: "string"
    })
    address: string;

    @property({
        type: "string"
    })
    phone: string;

    @property({
        type: "string"
    })
    fax: string;

    @property({
        type: "string"
    })
    cellular: string;

    @property({
        type: "string"
    })
    zipCode: string;

    @property({
        type: "string"
    })
    position: string;

    @property({
        type: "string"
    })
    resume: string;

    @property({
        type: "date"
    })
    birthDate: Date;

    @property({
        type: "string",
        required: true
    })
    status: "Register" | "Active" | "Disable";

    constructor(data?: Partial<User>) {
        super(data);
    }
}

export interface UserRelations extends UserModelRelations {}

export type UserWithRelations = User & UserRelations;
