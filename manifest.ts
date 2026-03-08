import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  DomainManifest,
  PluginContract,
  PluginLifecycleContext,
  ToolArgs,
  ToolHandlerDeps,
} from '@jshookmcp/extension-sdk/plugin';
import { getPluginBooleanConfig, loadPluginEnv } from '@jshookmcp/extension-sdk/plugin';

type TextToolResponse = {
  content: Array<{ type: 'text'; text: string }>;
};

loadPluginEnv(import.meta.url);

const PLUGIN_SLUG = 'template-plugin';
const PLUGIN_ID = 'io.github.example.template-plugin';
const DOMAIN = 'template-plugin';
const DEP_KEY = 'templatePluginHandlers';

let lifecycleContext: PluginLifecycleContext | null = null;

function toText(payload: unknown): TextToolResponse {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

class TemplatePluginHandlers {
  constructor(
    private readonly invokeTool: (name: string, args?: Record<string, unknown>) => Promise<unknown>,
    private readonly getConfig: <T = unknown>(path: string, fallback?: T) => T,
  ) {}

  async handleHealth(_args: ToolArgs = {}): Promise<TextToolResponse> {
    return toText({
      success: true,
      pluginId: PLUGIN_ID,
      loadedAt: lifecycleContext?.getRuntimeData('loadedAt') ?? null,
      enabled: lifecycleContext
        ? getPluginBooleanConfig(lifecycleContext, PLUGIN_SLUG, 'enabled', true)
        : false,
      defaultBaseUrl: this.getConfig(`plugins.${PLUGIN_SLUG}.baseUrl`, 'https://example.com'),
    });
  }

  async handleParallelSurfaceScan(args: ToolArgs = {}): Promise<TextToolResponse> {
    const includeLinks = args.includeLinks !== false;
    const jobs: Array<Promise<unknown>> = [
      this.invokeTool('page_get_local_storage', {}),
      this.invokeTool('page_get_cookies', {}),
    ];

    if (includeLinks) {
      jobs.push(this.invokeTool('page_get_all_links', {}));
    }

    const results = await Promise.all(jobs);

    return toText({
      success: true,
      includeLinks,
      localStorage: results[0],
      cookies: results[1],
      links: includeLinks ? results[2] : undefined,
    });
  }

  async handleOpenapiProbe(args: ToolArgs = {}): Promise<unknown> {
    const baseUrl =
      typeof args.baseUrl === 'string'
        ? args.baseUrl
        : String(this.getConfig(`plugins.${PLUGIN_SLUG}.baseUrl`, 'https://example.com'));

    return await this.invokeTool('api_probe_batch', {
      baseUrl,
      autoInjectAuth: true,
      paths: ['/docs', '/openapi.json', '/api/openapi.json', '/swagger.json'],
      includeBodyStatuses: [200, 201, 204],
      maxBodySnippetLength: 800,
    });
  }
}

function bind(methodName: keyof TemplatePluginHandlers) {
  return (deps: ToolHandlerDeps) => async (args: ToolArgs) => {
    const handlers = deps[DEP_KEY] as TemplatePluginHandlers;
    const method = handlers[methodName] as ((args: ToolArgs) => Promise<unknown>) | undefined;
    if (typeof method !== 'function') {
      throw new Error(`Missing template plugin handler: ${String(methodName)}`);
    }
    return await method.call(handlers, args ?? {});
  };
}

const tools: Tool[] = [
  {
    name: 'template_plugin_health',
    description: 'Return plugin status, load time, and default config values.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'template_parallel_surface_scan',
    description:
      'Run Promise.all against built-in page tools to collect localStorage, cookies, and optional links.',
    inputSchema: {
      type: 'object',
      properties: {
        includeLinks: {
          type: 'boolean',
          description: 'Whether to include page_get_all_links in the parallel scan.',
        },
      },
    },
  },
  {
    name: 'template_openapi_probe',
    description: 'Call api_probe_batch against a target baseUrl to discover Swagger/OpenAPI endpoints.',
    inputSchema: {
      type: 'object',
      properties: {
        baseUrl: {
          type: 'string',
          description: 'Target origin, for example https://example.com',
        },
      },
    },
  },
];

const domainManifest: DomainManifest<typeof DEP_KEY, TemplatePluginHandlers, typeof DOMAIN> = {
  kind: 'domain-manifest',
  version: 1,
  domain: DOMAIN,
  depKey: DEP_KEY,
  profiles: ['workflow', 'full'],
  ensure() {
    if (!lifecycleContext) {
      throw new Error('Plugin lifecycle context is not initialized. Reload extensions first.');
    }

    return new TemplatePluginHandlers(
      lifecycleContext.invokeTool.bind(lifecycleContext),
      lifecycleContext.getConfig.bind(lifecycleContext),
    );
  },
  registrations: [
    { tool: tools[0], domain: DOMAIN, bind: bind('handleHealth') },
    { tool: tools[1], domain: DOMAIN, bind: bind('handleParallelSurfaceScan') },
    { tool: tools[2], domain: DOMAIN, bind: bind('handleOpenapiProbe') },
  ],
};

const plugin: PluginContract = {
  manifest: {
    kind: 'plugin-manifest',
    version: 1,
    id: PLUGIN_ID,
    name: 'JSHook Plugin Template',
    pluginVersion: '0.1.0',
    entry: 'manifest.ts',
    description:
      'TypeScript-first template plugin showing PluginContract, built-in tool invocation, Promise.all parallel reads, and minimal permissions.',
    compatibleCore: '>=0.1.0',
    permissions: {
      network: { allowHosts: [] },
      process: { allowCommands: [] },
      filesystem: { readRoots: [], writeRoots: [] },
      toolExecution: {
        allowTools: ['page_get_local_storage', 'page_get_cookies', 'page_get_all_links', 'api_probe_batch'],
      },
    },
    activation: {
      onStartup: false,
      profiles: ['workflow', 'full'],
    },
    contributes: {
      domains: [domainManifest],
      workflows: [],
      configDefaults: {
        [`plugins.${PLUGIN_SLUG}.enabled`]: true,
        [`plugins.${PLUGIN_SLUG}.baseUrl`]: 'https://example.com',
      },
      metrics: [
        'template_plugin_health_calls_total',
        'template_parallel_surface_scan_calls_total',
        'template_openapi_probe_calls_total',
      ],
    },
  },

  onLoad(ctx) {
    lifecycleContext = ctx;
    ctx.setRuntimeData('loadedAt', new Date().toISOString());
  },

  onValidate(ctx) {
    const enabled = getPluginBooleanConfig(ctx, PLUGIN_SLUG, 'enabled', true);
    if (!enabled) {
      return { valid: false, errors: ['Plugin disabled by config'] };
    }
    return { valid: true, errors: [] };
  },

  onUnload() {
    lifecycleContext = null;
  },
};

export default plugin;