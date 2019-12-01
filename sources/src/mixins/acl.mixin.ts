// export function ACLMixin<
//     T extends Class<any>,
//     Permissions extends PermissionsList
// >(baseClass: T, configs: AuthorizationMixinConfigs<Permissions> = {}) {
//     return class extends baseClass {
//         constructor(options: ApplicationConfig = {}) {
//             super(options);

//             // Fix: servers start dependency bug
//             this.bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to({
//                 orderedGroups: ["acl.server.rest", "acl.server.graphql"]
//             });
//         }
//         async boot() {
//             await super.boot();

//             // Fix: servers start dependency bug
//             this.bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to({
//                 orderedGroups: ["server-rest", "server-graphql"]
//             });

//             // Servers binding
//             this.server(ACLRestServer);
//             this.server(ACLGQLServer);

//             // bind component level repositories
//             this.repository(UserGroupRepository);
//             this.repository(UserRoleRepository);
//             this.repository(GroupRoleRepository);
//             this.repository(RolePermissionRepository);
//         }

//         async migrateSchema(
//             options: SchemaMigrationOptions = {}
//         ): Promise<void> {
//             await super.migrateSchema(options);

//             if (configs.permissions) {
//                 // create default permissions
//                 const permissions = new configs.permissions();

//                 const permissionRepository: PermissionRepository<
//                     Permission,
//                     PermissionRelations
//                 > = this.getRepository(PermissionRepository);

//                 await permissionRepository.createAll(
//                     Object.keys(permissions).map(
//                         permissionKey =>
//                             new Permission({
//                                 id: createHash("md5")
//                                     .update(permissionKey)
//                                     .digest("hex"),
//                                 key: permissionKey,
//                                 description: (permissions as any)[permissionKey]
//                             })
//                     )
//                 );
//             }
//         }
//     };
// }
