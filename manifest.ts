import {
  createExtension,
  jsonResponse,
  getPluginBooleanConfig,
  loadPluginEnv,
} from '@jshookmcp/extension-sdk/plugin';
import type { ToolArgs, PluginLifecycleContext } from '@jshookmcp/extension-sdk/plugin';

loadPluginEnv(import.meta.url);

const PLUGIN_SLUG = 'template-plugin';

async function handleHealth(_args: ToolArgs, ctx: PluginLifecycleContext) {
  return jsonResponse({
    success: true,
    pluginId: ctx.pluginId,
    loadedAt: ctx.getRuntimeData('loadedAt') ?? null,
    enabled: getPluginBooleanConfig(ctx, PLUGIN_SLUG, 'enabled', true),
    defaultBaseUrl: ctx.getConfig(`plugins.${PLUGIN_SLUG}.baseUrl`, 'https://example.com'),
  });
}

async function handleParallelSurfaceScan(args: ToolArgs, ctx: PluginLifecycleContext) {
  const includeLinks = args.includeLinks !== false;
  const jobs: Array<Promise<unknown>> = [
    ctx.invokeTool('page_get_local_storage', {}),
    ctx.invokeTool('page_get_cookies', {}),
  ];

  if (includeLinks) {
    jobs.push(ctx.invokeTool('page_get_all_links', {}));
  }

  const results = await Promise.all(jobs);

  return jsonResponse({
    success: true,
    includeLinks,
    localStorage: results[0] as Record<string, unknown>,
    cookies: results[1] as Record<string, unknown>,
    links: includeLinks ? results[2] as Record<string, unknown> : undefined,
  });
}

async function handleOpenapiProbe(args: ToolArgs, ctx: PluginLifecycleContext) {
  const baseUrl =
    typeof args.baseUrl === 'string'
      ? args.baseUrl
      : String(ctx.getConfig(`plugins.${PLUGIN_SLUG}.baseUrl`, 'https://example.com'));

  const result = await ctx.invokeTool('api_probe_batch', {
    baseUrl,
    autoInjectAuth: true,
    paths: ['/docs', '/openapi.json', '/api/openapi.json', '/swagger.json'],
    includeBodyStatuses: [200, 201, 204],
    maxBodySnippetLength: 800,
  });

  return result;
}

export default createExtension('io.github.example.template-plugin', '0.1.0')
  .compatibleCore('>=0.1.0')
  .profile(['workflow', 'full'])
  .allowTool(['page_get_local_storage', 'page_get_cookies', 'page_get_all_links', 'api_probe_batch'])
  .configDefault(`plugins.${PLUGIN_SLUG}.enabled`, true)
  .configDefault(`plugins.${PLUGIN_SLUG}.baseUrl`, 'https://example.com')
  .metric([
    'template_plugin_health_calls_total',
    'template_parallel_surface_scan_calls_total',
    'template_openapi_probe_calls_total',
  ])
  .tool(
    'template_plugin_health',
    'Return plugin status, load time, and default config values.',
    {},
    handleHealth,
  )
  .tool(
    'template_parallel_surface_scan',
    'Run Promise.all against built-in page tools to collect localStorage, cookies, and optional links.',
    {
      includeLinks: { type: 'boolean', description: 'Whether to include page_get_all_links in the parallel scan.' },
    },
    handleParallelSurfaceScan,
  )
  .tool(
    'template_openapi_probe',
    'Call api_probe_batch against a target baseUrl to discover Swagger/OpenAPI endpoints.',
    {
      baseUrl: { type: 'string', description: 'Target origin, for example https://example.com' },
    },
    handleOpenapiProbe,
  )
  .onLoad((ctx) => { ctx.setRuntimeData('loadedAt', new Date().toISOString()); })
  .onValidate((ctx: PluginLifecycleContext) => {
    const enabled = getPluginBooleanConfig(ctx, PLUGIN_SLUG, 'enabled', true);
    if (!enabled) return { valid: false, errors: ['Plugin disabled by config'] };
    return { valid: true, errors: [] };
  });