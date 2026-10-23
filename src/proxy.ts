import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { BridgeConfig } from "./config.js";
import { FileOAuthProvider, waitForCallbackCode } from "./oauth.js";

const NAME = "herascrape-mcp";
const VERSION = "0.1.0";

/** Connect to the hosted server with an API key, or via browser OAuth. */
async function connectUpstream(config: BridgeConfig): Promise<Client> {
  const client = new Client({ name: NAME, version: VERSION });
  const url = new URL(config.url);

  if (config.apiKey) {
    await client.connect(
      new StreamableHTTPClientTransport(url, {
        requestInit: { headers: { "x-api-key": config.apiKey } },
      }),
    );
    return client;
  }

  // No key: let the SDK run OAuth. A stored token connects silently; otherwise
  // the provider opens the browser and the transport throws UnauthorizedError.
  const provider = new FileOAuthProvider(config.url);
  try {
    await client.connect(
      new StreamableHTTPClientTransport(url, { authProvider: provider }),
    );
    return client;
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) {
      throw error;
    }
  }

  const code = await waitForCallbackCode();
  const authed = new StreamableHTTPClientTransport(url, {
    authProvider: provider,
  });
  await authed.finishAuth(code);
  await client.connect(authed);
  return client;
}

/**
 * Run a stdio MCP server that proxies to the hosted herascrape MCP over
 * streamable HTTP. Tools are never defined here — they are forwarded live from
 * the server, so this bridge cannot drift from it.
 */
export async function startProxy(config: BridgeConfig): Promise<void> {
  const client = await connectUpstream(config);

  const server = new Server(
    { name: NAME, version: VERSION },
    { capabilities: { tools: {} } },
  );
  server.setRequestHandler(ListToolsRequestSchema, () => client.listTools());
  server.setRequestHandler(CallToolRequestSchema, (request) =>
    client.callTool(request.params),
  );

  await server.connect(new StdioServerTransport());
}
