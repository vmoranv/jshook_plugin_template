# jshook_plugin_template

TypeScript-first template repository for building a `jshook` plugin.

This template is intentionally narrow:

- show a minimal `PluginContract`
- demonstrate built-in tool invocation from a plugin
- show a safe `Promise.all` read-only parallel pattern
- keep permissions small and explicit
- keep TypeScript source in Git and generated JavaScript out of Git

## Included in the template

- `manifest.ts`: plugin source entrypoint
- `meta.yaml`: plugin metadata
- `.env.example`: local configuration sample
- `docs/agent-recipes.md`: recipes for parallel reads and subagent-assisted analysis
- `dist/manifest.js`: generated locally by `pnpm run build` and ignored by Git

## Built-in examples

The template ships with three example tools:

- `template_plugin_health`
- `template_parallel_surface_scan`
- `template_openapi_probe`

## Dependency model

This template uses the published npm package:

```json
{
  "@jshookmcp/extension-sdk": "^0.1.3"
}
```

## Install and build

```bash
pnpm install
pnpm run build
pnpm run check
```

## Loading behavior

`jshook` discovers both `manifest.ts` and `dist/manifest.js`, but when both exist it prefers the generated JavaScript entry.

That means the recommended workflow is:

1. edit `manifest.ts`
2. run `pnpm run build`
3. let `jshook` load `dist/manifest.js`

Do **not** commit `dist/`.

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

- `dist/`
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