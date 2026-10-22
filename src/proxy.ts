import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { BridgeConfig } from "./config.js";

const NAME = "herascrape-mcp";
const VERSION = "0.1.0";

/**
 * Run a stdio MCP server that proxies to the hosted herascrape MCP over
 * streamable HTTP. Tools are never defined here — they are forwarded live from
 * the server, so this bridge cannot drift from it.
 */
export async function startProxy(config: BridgeConfig): Promise<void> {
  const headers: Record<string, string> = {};
  if (config.apiKey) {
    headers["x-api-key"] = config.apiKey;
  }

  const client = new Client({ name: NAME, version: VERSION });
  await client.connect(
    new StreamableHTTPClientTransport(new URL(config.url), {
      requestInit: { headers },
    }),
  );

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
