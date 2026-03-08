# Agent Recipes for `jshook_plugin_template`

## Core rule

- parallelize reads, not shared page state mutations
- let the main agent keep control of the browser session
- use subagents for sidecar analysis, reporting, and endpoint classification

## Recipe 1: parallel surface reads

Good candidates for parallel fan-out:

- `extensions_list`
- `page_get_local_storage`
- `page_get_cookies`
- `network_get_requests`

Use this when the page is already open and you only need a quick state snapshot.

## Recipe 2: main agent drives, subagent summarizes

Recommended split:

- main agent
  - `page_navigate`
  - `template_openapi_probe`
  - `network_get_requests`
- subagent
  - organize endpoint matrix
  - summarize auth signals
  - draft HAR / Markdown report

## Recipe 3: what not to parallelize

Do not parallelize:

- `page_click` with `page_type`
- login plus second-factor steps
- multiple actions that can trigger navigation or mutate the same page state