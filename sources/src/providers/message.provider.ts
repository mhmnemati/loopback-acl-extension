import { Provider } from "@loopback/context";

import { MessageHandler } from "../types";

export class MessageProvider implements Provider<MessageHandler> {
    constructor() {}

    async value(): Promise<MessageHandler> {
        return async (userId, code, type) => {};
    }
}
