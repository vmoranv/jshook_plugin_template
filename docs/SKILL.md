# Plugin Development Guide

## Overview

This template demonstrates how to build a reusable jshook MCP plugin.

## Key Features

- **TypeScript-first**: Full type safety with modern TypeScript
- **createExtension()**: Simplified plugin registration API
- **Built-in tool invocation**: Examples of calling jshook tools from your plugin
- **Promise.all parallel reads**: Efficient batch operations for read-only tasks
- **Minimal permissions**: Security-first approach with least-privilege access

## Quick Start

```bash
# Install dependencies
pnpm install

# Type check
pnpm run check

# Build
pnpm run build

# Test locally
pnpm run dev
```

## Project Structure

```
.
├── manifest.ts          # Plugin entry point and extension definition
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── meta.yaml            # Extension metadata for registry
└── docs/
    └── SKILL.md         # This file - development guide
```

## Best Practices

### 1. Parallelize Reads, Not Writes

Good candidates for parallel execution:
- `extensions_list`
- `page_get_local_storage`
- `page_get_cookies`
- `network_get_requests`

Avoid parallelizing actions that mutate shared page state.

### 2. Let Main Agent Control Browser Session

Your plugin should not take control of the browser away from the main agent. Use sidecar analysis instead.

### 3. Use Subagents for Analysis

Recommended split:
- **Main agent**: Browser control, navigation, data collection
- **Subagent**: Endpoint classification, auth signal analysis, report drafting

## Registration

To register your plugin in the jshook MCP extension registry:

1. Ensure your repository has:
   - `meta.yaml` with name, description, author, tags
   - Public accessibility
   - Working `pnpm run check` and `pnpm run build`

2. Create an issue at [vmoranv/jshookmcpextension](https://github.com/vmoranv/jshookmcpextension/issues/new?template=register-extension.yml)

3. The sync workflow will automatically add your plugin to the registry on issue close

## Example Usage

```typescript
import { createExtension } from '@jshook/sdk';

export default createExtension({
  name: 'my-plugin',
  version: '1.0.0',
  
  async setup(ctx) {
    // Register your tools here
    ctx.registerTool('myTool', async (params) => {
      // Your implementation
    });
  },
});
```

## Resources

- [jshook Documentation](https://github.com/vmoranv/jshookmcp)
- [MCP Extension Registry](https://github.com/vmoranv/jshookmcpextension)
- [Example Plugins](https://github.com/vmoranv?tab=repositories&q=jshook_plugin_)
