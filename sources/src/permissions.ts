import { PermissionsList } from "loopback-authorization-extension";

export class Permissions extends PermissionsList {
    /** Users */
    USERS_READ = "Read users";
    USERS_WRITE = "Write users";
    USERS_READ_SELF = "Read self user";
    USERS_WRITE_SELF = "Write self user";

    /** Groups */
    GROUPS_READ = "Read groups";
    GROUPS_WRITE = "Write groups";

    /** Groups - Users */
    GROUPS_ADD_USER = "Add any user to any group";
    GROUPS_REMOVE_USER = "Add any user to any group";

    /** Roles */
    ROLES_READ = "Read roles";
    ROLES_WRITE = "Write roles";

    /** Roles - Users */
    ROLES_ADD_USER = "Add any user to any role";
    ROLES_REMOVE_USER = "Add any user to any role";

    /** Roles - Groups */
    ROLES_ADD_GROUP = "Add any group to any role";
    ROLES_REMOVE_GROUP = "Add any group to any role";

    /** Roles - Permissions */
    ROLES_ADD_PERMISSION = "Add any permission to any role";
    ROLES_REMOVE_PERMISSION = "Add any permission to any role";

    /** Permissions */
    PERMISSIONS_READ = "Read permissions";
    PERMISSIONS_WRITE = "Write permissions";
}
