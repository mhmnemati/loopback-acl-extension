import { Model, model, property } from "@loopback/repository";

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
