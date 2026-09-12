---
name: deepwiki
description: "Query AI-generated documentation for any public GitHub repository via DeepWiki MCP. Use for understanding codebases, exploring repo architecture, reading wiki-style docs, and asking questions about open-source projects. Triggers on: deepwiki, understand repo, explain codebase, how does this repo work."
---

# DeepWiki

AI-powered documentation and Q&A for any public GitHub repository, powered by Cognition/Devin AI.

## When to Use

- Understanding unfamiliar open-source codebases
- Exploring repository architecture and design patterns
- Getting AI-grounded answers about how a repo works internally
- Reading structured wiki-style documentation for any GitHub project
- Comparing architectural approaches across repos

## Available MCP Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `read_wiki_structure` | List all documentation topics for a repo | Get the table of contents for `vercel/next.js` |
| `read_wiki_contents` | Read specific documentation pages | Read the routing docs for `facebook/react` |
| `ask_question` | Ask any question about a repo (AI-powered) | "How does the reconciler work in facebook/react?" |

## Workflows

### Explore a New Repo

1. Get the structure first:
   ```
   read_wiki_structure(repo: "owner/repo")
   ```
2. Read specific topics of interest:
   ```
   read_wiki_contents(repo: "owner/repo", topic: "architecture")
   ```

### Ask a Specific Question

Use `ask_question` directly for targeted queries:
```
ask_question(repo: "vercel/next.js", question: "How does the App Router handle server components?")
```

### Compare Repos

Ask the same architectural question across different repos to compare approaches.

## Key Details

| Property | Value |
|----------|-------|
| **Server URL** | `https://mcp.deepwiki.com/mcp` |
| **Protocol** | Streamable HTTP (recommended) or SSE (`/sse`, deprecated) |
| **Auth** | None required |
| **Cost** | Free |
| **Scope** | Public GitHub repositories only |
| **Private repos** | Requires Devin account — use the [Devin MCP server](https://docs.devin.ai/work-with-devin/devin-mcp) instead |

## Limitations

- Only public GitHub repos are supported on the free tier
- Documentation is AI-generated, not official — verify critical details against actual source code
- Large repos may take a moment to index on first query
- Rate limits may apply for heavy usage (not publicly documented)

## Tips

- Prefer `ask_question` for specific queries — it uses RAG for grounded, context-aware answers
- Use `read_wiki_structure` first to discover what topics are available before diving in
- Combine with Context7 MCP: use DeepWiki for architecture understanding, Context7 for official API docs
