import {
    repository,
    DefaultKeyValueRepository,
    BelongsToAccessor
} from "@loopback/repository";
import { inject } from "@loopback/core";

import { Session, User } from "@acl/models";
import { UserRepository } from "@acl/repositories";

export class SessionRepository extends DefaultKeyValueRepository<Session> {
    public readonly user: BelongsToAccessor<User, string>;

    constructor(
        @inject("datasources.Redis") dataSource: RedisDataSource,
        @repository(UserRepository)
        protected userRepository: UserRepository
    ) {
        super(Session, dataSource);

        this.user = ((sourceId: string) =>
            userRepository.findById(sourceId)) as any;
    }
}
