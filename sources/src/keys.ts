import { bind, inject, BindingKey } from "@loopback/context";
import { TokenService } from "@loopback/authentication";

export namespace ACLBindings {
    export const TOKEN_SERVICE = BindingKey.create<TokenService>(
        "authentication.bearer.tokenService"
    );
}

/**
 * DataSource bind, inject functions
 *
 * 1. RDBMS: User, Group, Role, Permission
 * 2. CDBMS: Session, Code
 */
export function bindRDBMSDataSource() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ datasource: true });
        binding.tag({ rdbms: true });

        return binding;
    });
}
export function injectRDBMSDataSource() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.datasource &&
            binding.tagMap.rdbms
        );
    });
}

export function bindCDBMSDataSource() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ datasource: true });
        binding.tag({ cdbms: true });

        return binding;
    });
}
export function injectCDBMSDataSource() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.datasource &&
            binding.tagMap.cdbms
        );
    });
}

/**
 * Model bind, inject functions
 *
 * 1. User
 * 2. Group
 * 3. Role
 * 4. Permission
 * 5. Session
 * 6. Code
 */
export function bindUserModel() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ model: true });
        binding.tag({ user: true });

        return binding;
    });
}
export function injectUserModel() {
    return inject(binding => {
        return (
            binding.tagMap.acl && binding.tagMap.model && binding.tagMap.user
        );
    });
}

export function bindGroupModel() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ model: true });
        binding.tag({ group: true });

        return binding;
    });
}
export function injectGroupModel() {
    return inject(binding => {
        return (
            binding.tagMap.acl && binding.tagMap.model && binding.tagMap.group
        );
    });
}

export function bindRoleModel() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ model: true });
        binding.tag({ role: true });

        return binding;
    });
}
export function injectRoleModel() {
    return inject(binding => {
        return (
            binding.tagMap.acl && binding.tagMap.model && binding.tagMap.role
        );
    });
}

export function bindPermissionModel() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ model: true });
        binding.tag({ permission: true });

        return binding;
    });
}
export function injectPermissionModel() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.model &&
            binding.tagMap.permission
        );
    });
}

export function bindSessionModel() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ model: true });
        binding.tag({ session: true });

        return binding;
    });
}
export function injectSessionModel() {
    return inject(binding => {
        return (
            binding.tagMap.acl && binding.tagMap.model && binding.tagMap.session
        );
    });
}

export function bindCodeModel() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ model: true });
        binding.tag({ code: true });

        return binding;
    });
}
export function injectCodeModel() {
    return inject(binding => {
        return (
            binding.tagMap.acl && binding.tagMap.model && binding.tagMap.code
        );
    });
}

/**
 * Repository bind, inject functions
 *
 * 1. User
 * 2. Group
 * 3. Role
 * 4. Permission
 * 5. Session
 * 6. Code
 */
export function bindUserRepository() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ repository: true });
        binding.tag({ user: true });

        return binding;
    });
}
export function injectUserRepository() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.repository &&
            binding.tagMap.user
        );
    });
}

export function bindGroupRepository() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ repository: true });
        binding.tag({ group: true });

        return binding;
    });
}
export function injectGroupRepository() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.repository &&
            binding.tagMap.group
        );
    });
}

export function bindRoleRepository() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ repository: true });
        binding.tag({ role: true });

        return binding;
    });
}
export function injectRoleRepository() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.repository &&
            binding.tagMap.role
        );
    });
}

export function bindPermissionRepository() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ repository: true });
        binding.tag({ permission: true });

        return binding;
    });
}
export function injectPermissionRepository() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.repository &&
            binding.tagMap.permission
        );
    });
}

export function bindSessionRepository() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ repository: true });
        binding.tag({ session: true });

        return binding;
    });
}
export function injectSessionRepository() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.repository &&
            binding.tagMap.session
        );
    });
}

export function bindCodeRepository() {
    return bind(binding => {
        binding.tag({ acl: true });
        binding.tag({ repository: true });
        binding.tag({ code: true });

        return binding;
    });
}
export function injectCodeRepository() {
    return inject(binding => {
        return (
            binding.tagMap.acl &&
            binding.tagMap.repository &&
            binding.tagMap.code
        );
    });
}
