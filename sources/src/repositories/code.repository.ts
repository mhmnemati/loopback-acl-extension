import {
    DefaultKeyValueRepository,
    BelongsToAccessor,
    juggler
} from "@loopback/repository";

import { Code, User } from "@acl/models";
import { UserRepository } from "@acl/repositories";
import {
    bindCodeRepository,
    injectCodeModel,
    injectCDBMSDataSource,
    injectUserRepository
} from "@acl/keys";

@bindCodeRepository()
export class CodeRepository extends DefaultKeyValueRepository<Code> {
    public readonly user: BelongsToAccessor<User, string>;

    constructor(
        @injectCodeModel()
        ctor: (typeof Code & { prototype: Code })[],
        @injectCDBMSDataSource()
        dataSource: juggler.DataSource[],
        @injectUserRepository()
        userRepository: UserRepository[]
    ) {
        super(ctor[0], dataSource[0]);

        this.user = ((sourceId: string) =>
            userRepository[0].findById(sourceId)) as any;
    }
}
