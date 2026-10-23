import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";

import { resolveConfig } from "./config.js";
import { startProxy } from "./proxy.js";

async function main(): Promise<void> {
  await startProxy(resolveConfig(process.env));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (
    error instanceof UnauthorizedError ||
    /\b401\b|unauthoriz/i.test(message)
  ) {
    process.stderr.write(
      "herascrape-mcp: authentication required. Set HERASCRAPE_API_KEY=<your key> " +
        "(from https://herascrape.com), or complete the browser authorization prompt.\n",
    );
  } else {
    process.stderr.write(`herascrape-mcp: ${message}\n`);
  }
  process.exit(1);
});
