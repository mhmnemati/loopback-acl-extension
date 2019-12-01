import {
    DefaultKeyValueRepository,
    BelongsToAccessor,
    juggler
} from "@loopback/repository";

import { Session, User } from "@acl/models";
import { UserRepository } from "@acl/repositories";
import {
    bindSessionRepository,
    injectSessionModel,
    injectCDBMSDataSource,
    injectUserRepository
} from "@acl/keys";

@bindSessionRepository()
export class SessionRepository extends DefaultKeyValueRepository<Session> {
    public readonly user: BelongsToAccessor<User, string>;

    constructor(
        @injectSessionModel()
        ctor: (typeof Session & { prototype: Session })[],
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
