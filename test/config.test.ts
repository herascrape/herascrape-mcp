import { describe, expect, it } from "vitest";

import { DEFAULT_MCP_URL, resolveConfig } from "../src/config.js";

describe("resolveConfig", () => {
  it("defaults the URL and omits the key when env is empty", () => {
    const config = resolveConfig({});
    expect(config.url).toBe(DEFAULT_MCP_URL);
    expect(config.apiKey).toBeUndefined();
  });

  it("reads the API key and URL override from the environment", () => {
    const config = resolveConfig({
      HERASCRAPE_API_KEY: "hs_live_x",
      HERASCRAPE_MCP_URL: "https://staging.herascrape.com/mcp",
    });
    expect(config.apiKey).toBe("hs_live_x");
    expect(config.url).toBe("https://staging.herascrape.com/mcp");
  });

  it("treats blank env values as unset", () => {
    const config = resolveConfig({
      HERASCRAPE_API_KEY: "  ",
      HERASCRAPE_MCP_URL: "",
    });
    expect(config.url).toBe(DEFAULT_MCP_URL);
    expect(config.apiKey).toBeUndefined();
  });
});
