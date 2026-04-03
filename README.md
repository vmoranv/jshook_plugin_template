# jshook Plugin Template

TypeScript-first template for building reusable jshook MCP plugins.

## What This Template Provides

- **Minimal PluginContract**: Clean, focused plugin structure
- **Built-in Tool Invocation**: Examples of calling jshook tools from your plugin
- **Parallel Read Pattern**: Safe `Promise.all` pattern for read-only operations
- **Minimal Permissions**: Security-first with least-privilege defaults
- **Complete Development Chain**: From scaffolding to registry publication

## Quick Start

### 1. Scaffold Your Plugin

```bash
# Clone this template
git clone https://github.com/vmoranv/jshook_plugin_template.git my-plugin
cd my-plugin

# Install dependencies
pnpm install

# Type check
pnpm run check

# Build
pnpm run build
```

### 2. Customize Your Plugin

1. **Update identity** in `manifest.ts`:
   - Replace `PLUGIN_ID`, `PLUGIN_SLUG`, `PLUGIN_NAME`
   - Update description and author

2. **Implement your tools**:
   - Remove sample tools (`template_plugin_health`, etc.)
   - Add your own tool implementations

3. **Update permissions** in `manifest.ts`:
   - Keep only the built-in tools you actually need in `allowTools`
   - Add specific host allowlists in `network.allowHosts`
   - Configure filesystem roots if needed

4. **Add configuration validation** in `onValidate()`

### 3. Add Documentation

Create `docs/SKILL.md` with:
- Usage examples
- Configuration options
- SDK feature documentation
- Debugging tips

### 4. Create meta.yaml

```yaml
name: my-plugin
description: A brief description of what your plugin does
author: your-github-username
tags:
  - category1
  - category2
```

### 5. Test Locally

```bash
# Set plugin root
export MCP_PLUGIN_ROOTS=$(pwd)

# In jshook session:
# 1. extensions_reload
# 2. extensions_list
# 3. search_tools
```

### 6. Debug Your Plugin

Useful debugging commands in jshook:

```
# Check loaded extensions
extensions_list

# Find your tools
search_tools query="my-plugin"

# Check extension health
extension_healthcheck

# View extension logs (if available)
```

### 7. Publish to Registry

1. **Push to GitHub**: Make your repository public

2. **Ensure requirements**:
   - [ ] `meta.yaml` in root directory
   - [ ] `pnpm run check` passes
   - [ ] `pnpm run build` succeeds
   - [ ] `docs/SKILL.md` with usage docs (recommended)

3. **Create registration issue** at [vmoranv/jshookmcpextension](https://github.com/vmoranv/jshookmcpextension/issues/new?template=register-extension.yml):
   ```
   Kind: plugin
   Repository URL: https://github.com/your-username/my-plugin
   ```

4. **Sync happens automatically**:
   - On issue close
   - Daily scheduled workflow
   - Or manual workflow trigger

## Project Structure

```
.
├── manifest.ts          # Plugin entry point and contract definition
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── meta.yaml            # Extension metadata for registry
├── .env.example         # Local configuration sample
├── .gitignore           # Git ignore rules
└── docs/
    └── SKILL.md         # Usage documentation and SDK reference
```

## Built-in Example Tools

The template includes three example tools to demonstrate patterns:

- `template_plugin_health`: Basic health check tool
- `template_parallel_surface_scan`: Parallel read pattern example
- `template_openapi_probe`: API probing example

**Remove these** when implementing your own plugin.

## SDK Features

This template uses the official jshook extension SDK:

```json
{
  "@jshookmcp/extension-sdk": "^0.1.3"
}
```

Key SDK features:
- `createExtension()`: Simplified plugin registration
- Tool registration API
- Configuration validation hooks
- Lifecycle management

For full SDK documentation, see the [jshookmcp documentation](https://github.com/vmoranv/jshookmcp).

## Git Hygiene

This repo focuses on source and docs. Do NOT commit:

- `dist/` - Build output
- `node_modules/` - Dependencies
- `.env` - Environment files
- Runtime artifacts
- Screenshots
- Local sessions

## Load Behavior

jshook discovers both `manifest.ts` and `dist/manifest.js`, but prefers the generated JavaScript when both exist.

Recommended workflow:
1. Edit `manifest.ts`
2. Run `pnpm run build`
3. jshook loads `dist/manifest.js`

## Permission Model

This template starts with minimal permissions:

- `network.allowHosts`: empty (add your required hosts)
- `process.allowCommands`: empty (add if needed)
- `filesystem.readRoots/writeRoots`: empty (add if needed)
- `toolExecution.allowTools`: only built-in tools used by samples

Always request the minimum permissions your plugin needs.

## Resources

- [jshook Main Repo](https://github.com/vmoranv/jshookmcp)
- [Extension Registry](https://github.com/vmoranv/jshookmcpextension)
- [Example Plugins](https://github.com/vmoranv?tab=repositories&q=jshook_plugin_)
- [Example Workflows](https://github.com/vmoranv?tab=repositories&q=jshook_workflow_)
