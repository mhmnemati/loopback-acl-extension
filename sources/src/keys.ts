import { BindingKey } from "@loopback/context";
import { TokenService } from "@loopback/authentication";

export namespace Bindings {
    export const TOKEN_SERVICE = BindingKey.create<TokenService>(
        "authentication.bearer.tokenService"
    );
}
