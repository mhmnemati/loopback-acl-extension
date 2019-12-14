import { Provider } from "@loopback/context";

import { bindACL } from "../keys";
import { RegisterHandler } from "../types";

@bindACL("RegisterProvider")
export class RegisterProvider implements Provider<RegisterHandler> {
    async value(): Promise<RegisterHandler> {
        return async userId => {};
    }
}
