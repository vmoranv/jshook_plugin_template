# jshook_plugin_template

Template repository for building a `jshook` plugin with the smallest practical MVP.

This template is intentionally narrow:

- show a minimal `PluginContract`
- demonstrate built-in tool invocation from a plugin
- show a safe `Promise.all` read-only parallel pattern
- keep permissions small and explicit
- include an agent recipe document for MCP / subagent usage

## Included in the template

- `manifest.js`: plugin entrypoint
- `meta.yaml`: plugin metadata
- `.env.example`: local configuration sample
- `docs/agent-recipes.md`: recipes for parallel reads and subagent-assisted analysis

## Built-in examples

The template ships with three example tools:

- `template_plugin_health`
- `template_parallel_surface_scan`
- `template_openapi_probe`

They demonstrate:

- reading config and runtime state
- calling built-in tools through `ctx.invokeTool()`
- using `Promise.all` for read-only fan-out
- probing Swagger / OpenAPI endpoints with `api_probe_batch`

## Dependency model

At the moment, this template keeps `@jshookmcp/extension-sdk` as a **relative local dependency** so it can be co-developed next to the main `jshookmcp` repository.

Current default:

```json
{
  "@jshookmcp/extension-sdk": "file:../jshookmcp/packages/extension-sdk"
}
```

Recommended local layout:

```text
<workspace>/jshookmcp
<workspace>/jshook_plugin_template
```

If you later publish or consume a released SDK package, replace that dependency in `package.json` with your registry version.

## Install

```bash
pnpm install
pnpm run check
```

## Load the plugin into jshook

Set:

```bash
MCP_PLUGIN_ROOTS=<path-to-cloned-jshook_plugin_template>
```

Then run inside `jshook`:

1. `extensions_reload`
2. `extensions_list`
3. `search_tools`

## Permission model

This template intentionally starts from minimal permissions:

- `network.allowHosts`: empty
- `process.allowCommands`: empty
- `filesystem.readRoots/writeRoots`: empty
- `toolExecution.allowTools`: only the built-in tools actually used by the sample plugin

## Git hygiene

Keep this repo focused on source and docs.
Do not commit:

- `node_modules/`
- `.env`
- runtime artifacts
- screenshots
- local sessions
- host-specific temp output

## What to change first

1. replace `PLUGIN_ID`, `PLUGIN_SLUG`, and `DOMAIN`
2. remove the sample tools
3. keep only the built-in tools you actually need in `allowTools`
4. add your own config validation in `onValidate()`
5. reload extensions and verify visibility in runtime
