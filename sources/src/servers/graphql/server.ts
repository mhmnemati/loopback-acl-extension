import {
    inject,
    lifeCycleObserver,
    Context,
    Server,
    CoreBindings,
    Application
} from "@loopback/core";

import { ACLRestServer } from "@acl/servers/rest/server";

import { ApolloServer } from "apollo-server";
import { createGraphQlSchema } from "openapi-to-graphql";

@lifeCycleObserver("server-graphql")
export class ACLGQLServer extends Context implements Server {
    private _listening: boolean = false;
    private _server: ApolloServer;

    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        app: Application
    ) {
        super(app);
    }

    get listening() {
        return this._listening;
    }
    async start() {
        const restServer = this.getSync<ACLRestServer>("servers.ACLRestServer");

        // Fix: openapi default servers not added
        let openApiSpec: any = restServer.getApiSpec();
        openApiSpec.servers = [{ url: restServer.url }];

        // get OpenAPI specs from restServer and bind REST url to it
        const { schema, report } = await createGraphQlSchema(openApiSpec, {
            fillEmptyResponses: true
        });

        this._server = new ApolloServer({ schema });

        const url = (
            await this._server.listen({
                host: process.env.HTTP_LOCAL_HOST,
                port: process.env.HTTP_GQL_PORT
            })
        ).url;
        this._listening = true;

        console.log(`GraphQL Server is running on url ${url}`);
    }
    async stop() {
        await this._server.stop();
        this._listening = false;

        console.log(`QraphQL Server is stopped!`);
    }
}
