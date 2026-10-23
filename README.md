# herascrape-mcp

**Instagram data for AI agents, over the [Model Context Protocol](https://modelcontextprotocol.io).**
Point Claude, Cursor, ChatGPT, VS Code, or any MCP client at herascrape-mcp and
it can read public Instagram profiles, content, engagement, and search results
directly — no scraping code, no browser, no login.

[![Install MCP Server](https://img.shields.io/badge/Install_MCP_Server-herascrape-3098d8?style=flat-square)](https://install.apicommons.org/?config=eyJuYW1lIjoiaGVyYXNjcmFwZSIsInJlbW90ZSI6eyJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vaGVyYXNjcmFwZS5jb20vbWNwIn19)

Every endpoint is one tool, generated from the live API, so the tool list never
drifts from what the server serves. It is read-only, cursor-paginated, and flat
**$0.0004 per successful call** (only 2xx is billed). Powered by the
[herascrape](https://herascrape.com) Instagram API.

## What agents can do with it

- **Profiles & audiences** — resolve a username or user id to a full profile;
  page a user's followers and following; pull the "about" / account details.
- **Content** — a user's posts, reels, tagged posts, live stories, highlights,
  and reposts; fetch any individual post or reel by id.
- **Engagement** — read a post's comments and their replies; see who liked a
  post or a comment.
- **Discovery** — hashtag top / recent / reels; a location's top & recent
  media; trending audio and the clips using a given audio track.
- **Search** — users, hashtags, audio, places, and a universal "top" search.
- **Utilities** — resolve a shortcode or URL to a media id, oEmbed a post, and
  check your live balance.

Agents reach for these when a task needs *what's actually on Instagram right
now* — audience research, competitor and campaign tracking, influencer
vetting, trend and hashtag analysis, enriching a profile or a post.

## Install — one click

The button above opens a client picker and installs herascrape-mcp wherever you
run agents. For clients with native one-click install:

[![Add to Cursor](https://img.shields.io/badge/Add_to_Cursor-0b1220?style=flat-square)](https://cursor.com/en/install-mcp?name=herascrape&config=eyJ1cmwiOiJodHRwczovL2hlcmFzY3JhcGUuY29tL21jcCJ9)
[![Add to VS Code](https://img.shields.io/badge/Add_to_VS_Code-0b1220?style=flat-square)](https://vscode.dev/redirect/mcp/install?name=herascrape&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fherascrape.com%2Fmcp%22%7D)
[![Add to VS Code Insiders](https://img.shields.io/badge/Add_to_VS_Code_Insiders-0b1220?style=flat-square)](https://insiders.vscode.dev/redirect/mcp/install?name=herascrape&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fherascrape.com%2Fmcp%22%7D&quality=insiders)
[![Add to Visual Studio](https://img.shields.io/badge/Add_to_Visual_Studio-0b1220?style=flat-square)](https://vs-open.link/mcp-install?%7B%22name%22%3A%22herascrape%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fherascrape.com%2Fmcp%22%7D)
[![Add to LM Studio](https://img.shields.io/badge/Add_to_LM_Studio-0b1220?style=flat-square)](lmstudio://add_mcp?name=herascrape&config=eyJ1cmwiOiJodHRwczovL2hlcmFzY3JhcGUuY29tL21jcCJ9)
[![Add to Goose](https://img.shields.io/badge/Add_to_Goose-0b1220?style=flat-square)](goose://extension?url=https%3A%2F%2Fherascrape.com%2Fmcp&type=streamable_http&id=herascrape&name=herascrape&description=herascrape)

Get an API key (or sign in to authorize in-browser) from your
[herascrape dashboard](https://herascrape.com).

## Install — manual

### Remote (recommended) — connect by URL, authorize in the browser

Hosts that support remote MCP connect to the hosted server and authorize with a
click (OAuth); no key to copy.

- **Claude Code:** `claude mcp add herascrape --transport http https://herascrape.com/mcp`
- **Cursor / Claude Desktop / ChatGPT:**

  ```json
  {
    "mcpServers": {
      "herascrape": { "url": "https://herascrape.com/mcp" }
    }
  }
  ```

### Local (stdio-only hosts) — run the bridge from source

Only needed for hosts that cannot connect to a remote MCP server. The bridge is
a thin stdio-to-HTTP proxy to the hosted server: it forwards your API key as
`x-api-key` and relays the live tool list and calls — it defines no tools of its
own. It is not published to a package registry; clone and build it (Node ≥ 18):

```sh
git clone https://github.com/herascrape/herascrape-mcp && cd herascrape-mcp
npm install && npm run build
```

Then point your client at the built entry, with an API key from your
[dashboard](https://herascrape.com):

```json
{
  "mcpServers": {
    "herascrape": {
      "command": "node",
      "args": ["/abs/path/to/herascrape-mcp/dist/index.js"],
      "env": { "HERASCRAPE_API_KEY": "your_key" }
    }
  }
}
```

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `HERASCRAPE_API_KEY` | — | Sent as `x-api-key`. Required when running the bridge from source. |
| `HERASCRAPE_MCP_URL` | `https://herascrape.com/mcp` | Override the server URL (e.g. staging). |

## License

MIT
