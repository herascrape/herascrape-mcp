import { resolveConfig } from "./config.js";
import { startProxy } from "./proxy.js";

async function main(): Promise<void> {
  await startProxy(resolveConfig(process.env));
}

main().catch((error: unknown) => {
  process.stderr.write(`herascrape-mcp: ${String(error)}\n`);
  process.exit(1);
});
