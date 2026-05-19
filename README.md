# jshook Plugin Template

A TypeScript-first template for building jshook MCP plugins with the current
`createExtension()` SDK.

This template consumes the published `@jshookmcp/extension-sdk` package. Do not
switch it to `workspace:`, `link:`, or `file:` dependencies.

## What's Included

- `manifest.ts` - Plugin entry point with example tools
- `meta.yaml` - Extension metadata for registry
- `.gitignore` - Standard ignores for jshook projects

## Quick Start

```bash
pnpm install
pnpm build
pnpm check
```

## Files Explained

| File | Purpose |
|------|---------|
| `manifest.ts` | Runtime plugin definition built with `createExtension()` |
| `package.json` | Current SDK/runtime dependencies |
| `tsconfig.json` | TypeScript configuration |
| `meta.yaml` | Single source of truth for outward metadata (name, description, author, source_repo) |

## Example Tools

This template includes 3 sample tools:

1. **template_plugin_health** - Basic health check
2. **template_parallel_surface_scan** - Parallel read pattern demo
3. **template_openapi_probe** - API probing example

Replace these with your own implementations.

## Local Testing

PowerShell:

```powershell
$env:MCP_PLUGIN_ROOTS = (Get-Location).Path
# In jshook: reload_extensions, then call your tool or search_tools
```

macOS / Linux:

```bash
export MCP_PLUGIN_ROOTS=$(pwd)
# In jshook: reload_extensions, then call your tool or search_tools
```

You can also point `MCP_PLUGIN_ROOTS` at a parent directory containing multiple
plugin folders separated by commas.

## Publishing

1. Push to GitHub (public repo)
2. Keep `@jshookmcp/extension-sdk` on a published semver range
3. Ensure `meta.yaml` exists with valid metadata
4. Create issue at vmoranv/jshookmcpextension (see docs/SKILL.md for agent usage)

## Notes

- Keep `manifest.ts` as the runtime entrypoint and `meta.yaml` as the metadata source of truth.
- Do not duplicate `name` / `description` / `author` / `source_repo` in `manifest.ts`.
- Build before `reload_extensions` so the core can prefer `dist/manifest.js`.
- Declare only the built-in tools your plugin really needs in `.allowTool(...)`.

## See Also

- [docs/SKILL.md](docs/SKILL.md) - Agent usage documentation
- [jshookmcp](https://github.com/vmoranv/jshookmcp) - Main repository
- [Extension Registry](https://github.com/vmoranv/jshookmcpextension) - Registry issues
