export * from "./keys";
export * from "./types";

export * from "./interceptors";
export * from "./models";
export * from "./repositories";
export * from "./providers";
export * from "./servers";
export * from "./mixins";

import { GenerateUsersController } from "./servers/rest/controllers";
import { User } from "./models";

GenerateUsersController(User);
