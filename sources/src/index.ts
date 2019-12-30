export * from "./keys";
export * from "./types";

export * from "./decorators";
export * from "./interceptors";
export * from "./models";
export * from "./repositories";
export * from "./providers";
export * from "./servers";
export * from "./mixins";

import { User } from "./";

console.log(User.definition.relations.userRoles.source);
