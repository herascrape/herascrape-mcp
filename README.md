# herascrape-mcp

The [herascrape](https://herascrape.com) Instagram API as MCP tools, so coding
agents — Claude Code, Claude Desktop, Cursor, and anything else that speaks the
[Model Context Protocol](https://modelcontextprotocol.io) — can read Instagram
profiles, posts, comments, hashtags, locations, audio, and search directly.

Every endpoint is one tool, generated from the live API, so the tool list never
drifts from what the server actually serves. Each successful call costs a flat
**$0.0004** (only 2xx responses are billed); list tools return a `next_cursor`
you pass back to page.

## Connect

Get an API key from your [herascrape dashboard](https://herascrape.com), then
pick one of the two ways in.

### Remote (recommended) — connect by URL, authorize in the browser

Hosts that support remote MCP can connect to the hosted server and authorize
with a single click (OAuth); no key to copy.

- **Claude Code:** `claude mcp add herascrape --transport http https://herascrape.com/mcp`
- **Cursor / Claude Desktop:** add to your MCP config:

  ```json
  {
    "mcpServers": {
      "herascrape": { "url": "https://herascrape.com/mcp" }
    }
  }
  ```

### Local — `npx`, with an API key

For hosts that only run local (stdio) servers. Needs Node ≥ 18.

- **Claude Code:**

  ```sh
  claude mcp add herascrape --env HERASCRAPE_API_KEY=your_key -- npx -y herascrape-mcp
  ```

- **Claude Desktop / Cursor** (`claude_desktop_config.json` / `.cursor/mcp.json`):

  ```json
  {
    "mcpServers": {
      "herascrape": {
        "command": "npx",
        "args": ["-y", "herascrape-mcp"],
        "env": { "HERASCRAPE_API_KEY": "your_key" }
      }
    }
  }
  ```

The local bridge is a thin stdio-to-HTTP proxy to the hosted server: it forwards
your key as `x-api-key` and relays the live tool list and calls. It defines no
tools of its own.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `HERASCRAPE_API_KEY` | — | Sent as `x-api-key`. Required for the local bridge. |
| `HERASCRAPE_MCP_URL` | `https://herascrape.com/mcp` | Override the server URL (e.g. staging). |

## License

MIT
