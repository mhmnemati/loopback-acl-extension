import { Entity, model, property, belongsTo } from "@loopback/repository";
import { User, UserWithRelations } from "../models";

@model({ settings: {} })
export class Code extends Entity {
    @property({
        type: "string",
        required: true
    })
    type: "Account" | "Password";

    @belongsTo(() => User)
    userId: string;

    constructor(data?: Partial<Code>) {
        super(data);
    }
}

export interface CodeRelations {
    user: UserWithRelations;
}

export type CodeWithRelations = Code & CodeRelations;
