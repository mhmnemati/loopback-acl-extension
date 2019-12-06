import {
    inject,
    lifeCycleObserver,
    Context,
    Server,
    CoreBindings,
    Application
} from "@loopback/core";

import { ACLBindings } from "~/keys";
import { ACLGraphQLServerConfig } from "~/types";
import { ACLRestServer } from "~/servers";

import { ApolloServer } from "apollo-server";
import { createGraphQlSchema } from "openapi-to-graphql";

@lifeCycleObserver("servers.GraphQL")
export class ACLGQLServer extends Context implements Server {
    private _listening: boolean = false;
    private _server: ApolloServer;

    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        app: Application,
        @inject(ACLBindings.GRAPHQL_SERVER_CONFIG)
        public config: ACLGraphQLServerConfig = {}
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

        const url = (await this._server.listen(this.config)).url;
        this._listening = true;

        console.log(`GraphQL Server is running on url ${url}`);
    }
    async stop() {
        await this._server.stop();
        this._listening = false;

        console.log(`QraphQL Server is stopped!`);
    }
}
