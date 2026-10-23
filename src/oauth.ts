import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { join } from "node:path";

import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import type {
  OAuthClientInformation,
  OAuthClientInformationFull,
  OAuthClientMetadata,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";

const CALLBACK_PORT = 33418;
export const REDIRECT_URL = `http://127.0.0.1:${CALLBACK_PORT}/callback`;

interface Store {
  clientInformation?: OAuthClientInformationFull;
  tokens?: OAuthTokens;
  codeVerifier?: string;
}

/**
 * OAuth client provider that persists the dynamic registration, tokens, and
 * PKCE verifier to a per-server file so a browser authorization is a one-time
 * step. The SDK drives the actual flow; this only stores state and opens the
 * browser.
 */
export class FileOAuthProvider implements OAuthClientProvider {
  private readonly file: string;
  private store: Store;

  constructor(serverUrl: string) {
    const dir = join(
      process.env.XDG_CONFIG_HOME || join(homedir(), ".config"),
      "herascrape-mcp",
    );
    mkdirSync(dir, { recursive: true });
    const key = Buffer.from(serverUrl).toString("hex").slice(0, 40);
    this.file = join(dir, `oauth-${key}.json`);
    this.store = this.load();
  }

  private load(): Store {
    try {
      return JSON.parse(readFileSync(this.file, "utf8")) as Store;
    } catch {
      return {};
    }
  }

  private persist(): void {
    writeFileSync(this.file, JSON.stringify(this.store), { mode: 0o600 });
  }

  get redirectUrl(): string {
    return REDIRECT_URL;
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: "herascrape-mcp",
      redirect_uris: [REDIRECT_URL],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    };
  }

  clientInformation(): OAuthClientInformation | undefined {
    return this.store.clientInformation;
  }

  saveClientInformation(info: OAuthClientInformationFull): void {
    this.store.clientInformation = info;
    this.persist();
  }

  tokens(): OAuthTokens | undefined {
    return this.store.tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    this.store.tokens = tokens;
    this.persist();
  }

  saveCodeVerifier(verifier: string): void {
    this.store.codeVerifier = verifier;
    this.persist();
  }

  codeVerifier(): string {
    if (!this.store.codeVerifier) {
      throw new Error("no PKCE code verifier saved");
    }
    return this.store.codeVerifier;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    const url = authorizationUrl.toString();
    process.stderr.write(
      `herascrape-mcp: authorize in your browser:\n${url}\n`,
    );
    openBrowser(url);
  }
}

function openBrowser(url: string): void {
  const [cmd, args]: [string, string[]] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
  } catch {
    // URL is already on stderr; the user can open it manually.
  }
}

/** Run a one-shot loopback server and resolve with the authorization code. */
export function waitForCallbackCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const requested = new URL(req.url ?? "", REDIRECT_URL);
      const code = requested.searchParams.get("code");
      const error = requested.searchParams.get("error");
      res.writeHead(200, { "content-type": "text/html" });
      res.end(
        "<html><body>herascrape-mcp: you can close this tab.</body></html>",
      );
      server.close();
      if (error) {
        reject(new Error(`authorization failed: ${error}`));
      } else if (code) {
        resolve(code);
      } else {
        reject(new Error("no authorization code in callback"));
      }
    });
    server.on("error", reject);
    server.listen(CALLBACK_PORT, "127.0.0.1");
  });
}
