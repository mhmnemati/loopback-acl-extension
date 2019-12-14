import { Provider } from "@loopback/context";

import { RegisterHandler } from "../types";

export class RegisterProvider implements Provider<RegisterHandler> {
    async value(): Promise<RegisterHandler> {
        return async userId => {
            console.log(`User ${userId} Activated`);
        };
    }
}
