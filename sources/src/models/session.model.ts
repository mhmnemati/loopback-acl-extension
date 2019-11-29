import {
    Entity,
    Model,
    model,
    property,
    belongsTo
} from "@loopback/repository";
import { User, UserWithRelations } from "@acl/models";

@model({ settings: {} })
export class Session extends Entity {
    @property({
        type: "string",
        required: true
    })
    token: string;

    @property({
        type: "string",
        required: true
    })
    ip: string;

    @property({
        type: "string"
    })
    device: string;

    @property({
        type: "date",
        required: true
    })
    date: Date;

    @property({
        type: "number",
        required: true
    })
    ttl: number;

    @property.array(String)
    permissions: string[];

    @belongsTo(() => User)
    userId: string;

    constructor(data?: Partial<Session>) {
        super(data);
    }
}

export interface SessionRelations {
    user: UserWithRelations;
}

export type SessionWithRelations = Session & SessionRelations;

@model({ settings: {} })
export class Token extends Model {
    @property({
        type: "string",
        required: true
    })
    token: string;

    constructor(data?: Partial<Token>) {
        super(data);
    }
}
