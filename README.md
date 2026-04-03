# jshook Plugin Template

A minimal template for building jshook MCP plugins.

## What's Included

- `manifest.ts` - Plugin entry point with example tools
- `meta.yaml` - Extension metadata for registry
- `.gitignore` - Standard ignores for jshook projects

## Quick Start

```bash
pnpm install
pnpm run build
pnpm run check
```

## Files Explained

| File | Purpose |
|------|---------|
| `manifest.ts` | Plugin definition and tool implementations |
| `package.json` | Dependencies (uses @jshookmcp/extension-sdk) |
| `tsconfig.json` | TypeScript configuration |
| `meta.yaml` | Registry metadata (name, description, author, tags) |

## Example Tools

This template includes 3 sample tools:

1. **template_plugin_health** - Basic health check
2. **template_parallel_surface_scan** - Parallel read pattern demo
3. **template_openapi_probe** - API probing example

Replace these with your own implementations.

## Local Testing

```bash
export MCP_PLUGIN_ROOTS=$(pwd)
# In jshook: extensions_reload, then search_tools
```

## Publishing

1. Push to GitHub (public repo)
2. Ensure `meta.yaml` exists with valid metadata
3. Create issue at vmoranv/jshookmcpextension (see docs/SKILL.md for agent usage)

## See Also

- [docs/SKILL.md](docs/SKILL.md) - Agent usage documentation
- [jshookmcp](https://github.com/vmoranv/jshookmcp) - Main repository
- [Extension Registry](https://github.com/vmoranv/jshookmcpextension) - Registry issues
