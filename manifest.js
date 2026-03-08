import { getPluginBooleanConfig, loadPluginEnv } from '@jshookmcp/extension-sdk/plugin';

/** @typedef {import('@jshookmcp/extension-sdk/plugin').PluginContract} PluginContract */
/** @typedef {import('@jshookmcp/extension-sdk/plugin').PluginLifecycleContext} PluginLifecycleContext */
/** @typedef {import('@jshookmcp/extension-sdk/plugin').DomainManifest} DomainManifest */
/** @typedef {import('@jshookmcp/extension-sdk/plugin').ToolArgs} ToolArgs */
/** @typedef {import('@jshookmcp/extension-sdk/plugin').ToolHandlerDeps} ToolHandlerDeps */
/** @typedef {import('@modelcontextprotocol/sdk/types.js').Tool} Tool */
/** @typedef {{ content: Array<{ type: 'text', text: string }> }} TextToolResponse */

loadPluginEnv(import.meta.url);

const PLUGIN_SLUG = 'template-plugin';
const PLUGIN_ID = 'io.github.example.template-plugin';
const DOMAIN = 'template-plugin';
const DEP_KEY = 'templatePluginHandlers';

/** @type {PluginLifecycleContext | null} */
let lifecycleContext = null;

/**
 * @param {unknown} payload
 * @returns {TextToolResponse}
 */
function toText(payload) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

class TemplatePluginHandlers {
  /**
   * @param {(name: string, args?: Record<string, unknown>) => Promise<unknown>} invokeTool
   * @param {(path: string, fallback?: unknown) => unknown} getConfig
   */
  constructor(invokeTool, getConfig) {
    /** @type {(name: string, args?: Record<string, unknown>) => Promise<unknown>} */
    this.invokeTool = invokeTool;
    /** @type {(path: string, fallback?: unknown) => unknown} */
    this.getConfig = getConfig;
  }

  /**
   * @param {ToolArgs} _args
   * @returns {Promise<TextToolResponse>}
   */
  async handleHealth(_args = {}) {
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

  /**
   * @param {ToolArgs} args
   * @returns {Promise<TextToolResponse>}
   */
  async handleParallelSurfaceScan(args = {}) {
    const includeLinks = args.includeLinks !== false;
    const jobs = [
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

  /**
   * @param {ToolArgs} args
   * @returns {Promise<unknown>}
   */
  async handleOpenapiProbe(args = {}) {
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

/**
 * @param {string} methodName
 * @returns {(deps: ToolHandlerDeps) => (args: ToolArgs) => Promise<unknown>}
 */
function bind(methodName) {
  return (deps) => async (args) => {
    const handlers = /** @type {Record<string, unknown>} */ (deps[DEP_KEY]);
    const method = handlers[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Missing template plugin handler: ${methodName}`);
    }
    return await method.call(handlers, args ?? {});
  };
}

/** @type {Tool[]} */
const tools = [
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
    description: 'Run Promise.all against built-in page tools to collect localStorage, cookies, and optional links.',
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

/** @type {DomainManifest} */
const domainManifest = {
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

/** @type {PluginContract} */
const plugin = {
  manifest: {
    kind: 'plugin-manifest',
    version: 1,
    id: PLUGIN_ID,
    name: 'JSHook Plugin Template',
    pluginVersion: '0.1.0',
    entry: 'manifest.js',
    description:
      'Template plugin showing PluginContract, built-in tool invocation, Promise.all parallel reads, and minimal permissions.',
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

