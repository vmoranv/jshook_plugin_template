# jshook Plugin Template - Agent Skill Documentation

## For Agents Using This Template

This template provides a reusable plugin scaffold for jshook MCP.

## Available Tools (After Loading)

When this plugin is loaded in a jshook session, the following tools become available:

### template_plugin_health
**Purpose**: Check plugin health status  
**Arguments**: None  
**Returns**: `{ status: "ok", timestamp: string }`

### template_parallel_surface_scan
**Purpose**: Demonstrate parallel read pattern  
**Arguments**: None  
**Returns**: `{ extensions: array, localStorage: object, cookies: array }`

### template_openapi_probe
**Purpose**: Probe for OpenAPI/Swagger endpoints  
**Arguments**: `{ url?: string }`  
**Returns**: `{ endpoints: array, swaggerFound: boolean }`

## SDK Functions Used

```typescript
import { createExtension } from '@jshookmcp/extension-sdk';

export default createExtension({
  id: 'PLUGIN_ID',
  slug: 'PLUGIN_SLUG',
  name: 'Plugin Name',
  version: '1.0.0',
  
  async setup(ctx) {
    ctx.registerTool('toolName', async (args) => {
      // Tool implementation
    });
  },
});
```

## Configuration

```yaml
plugins.template.*
```

## Permissions Required

```typescript
{
  toolExecution: {
    allowTools: [
      "page_navigate",
      "page_get_local_storage",
      "network_get_requests"
    ]
  }
}
```

## Parallel Read Pattern

Safe to parallelize (Promise.all):
- `page_get_local_storage`
- `page_get_cookies`  
- `network_get_requests`
- `extensions_list`

Do NOT parallelize:
- Actions that mutate page state
- Multiple navigation commands

## Build & Verify

```bash
pnpm install
pnpm run build   # Outputs dist/manifest.js
pnpm run check   # TypeScript type check
```

## Load Into jshook

1. Set env: `MCP_PLUGIN_ROOTS=/path/to/template`
2. In jshook: `extensions_reload`
3. Verify: `extensions_list` shows the plugin
4. Find tools: `search_tools query="template"`
