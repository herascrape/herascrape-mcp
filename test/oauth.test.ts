import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileOAuthProvider, REDIRECT_URL } from "../src/oauth.js";

describe("FileOAuthProvider", () => {
  let previous: string | undefined;

  beforeEach(() => {
    previous = process.env.XDG_CONFIG_HOME;
    process.env.XDG_CONFIG_HOME = mkdtempSync(join(tmpdir(), "hs-mcp-"));
  });

  afterEach(() => {
    if (previous === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = previous;
  });

  it("advertises a loopback redirect and public-client metadata", () => {
    const provider = new FileOAuthProvider("https://herascrape.com/mcp");
    expect(provider.redirectUrl).toBe(REDIRECT_URL);
    const meta = provider.clientMetadata;
    expect(meta.redirect_uris).toEqual([REDIRECT_URL]);
    expect(meta.token_endpoint_auth_method).toBe("none");
  });

  it("persists tokens, client info, and verifier across instances", () => {
    const url = "https://herascrape.com/mcp";
    const a = new FileOAuthProvider(url);
    a.saveCodeVerifier("verifier-xyz");
    a.saveClientInformation({
      client_id: "cid-1",
      redirect_uris: [REDIRECT_URL],
    });
    a.saveTokens({ access_token: "hs_mcp_tok", token_type: "bearer" });

    const b = new FileOAuthProvider(url);
    expect(b.codeVerifier()).toBe("verifier-xyz");
    expect(b.clientInformation()?.client_id).toBe("cid-1");
    expect(b.tokens()?.access_token).toBe("hs_mcp_tok");
  });

  it("keeps separate state per server URL", () => {
    const a = new FileOAuthProvider("https://herascrape.com/mcp");
    a.saveTokens({ access_token: "a", token_type: "bearer" });
    const other = new FileOAuthProvider("https://staging.herascrape.com/mcp");
    expect(other.tokens()).toBeUndefined();
  });
});
