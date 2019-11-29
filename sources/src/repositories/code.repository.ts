import {
    repository,
    DefaultKeyValueRepository,
    BelongsToAccessor
} from "@loopback/repository";
import { inject } from "@loopback/core";

import { Code, User } from "@acl/models";
import { UserRepository } from "@acl/repositories";

export class CodeRepository extends DefaultKeyValueRepository<Code> {
    public readonly user: BelongsToAccessor<User, string>;

    constructor(
        @inject("datasources.Redis") dataSource: RedisDataSource,
        @repository(UserRepository)
        protected userRepository: UserRepository
    ) {
        super(Code, dataSource);

        this.user = ((sourceId: string) =>
            userRepository.findById(sourceId)) as any;
    }
}
