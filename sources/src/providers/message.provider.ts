import { Provider } from "@loopback/context";

import { bindACL } from "../keys";
import { MessageHandler } from "../types";

@bindACL("MessageProvider")
export class MessageProvider implements Provider<MessageHandler> {
    constructor() {}

    async value(): Promise<MessageHandler> {
        return async (userId, code, type) => {};
    }
}
