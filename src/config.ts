export const DEFAULT_MCP_URL = "https://herascrape.com/mcp";

export interface BridgeConfig {
  url: string;
  apiKey: string | undefined;
}

/**
 * Resolve the bridge config from the environment.
 *
 * `HERASCRAPE_MCP_URL` overrides the hosted server URL (default
 * {@link DEFAULT_MCP_URL}); `HERASCRAPE_API_KEY`, when set, is sent as the
 * `x-api-key` header so the bridge authenticates headlessly.
 */
export function resolveConfig(env: NodeJS.ProcessEnv): BridgeConfig {
  const url = env.HERASCRAPE_MCP_URL?.trim() || DEFAULT_MCP_URL;
  const apiKey = env.HERASCRAPE_API_KEY?.trim() || undefined;
  return { url, apiKey };
}
