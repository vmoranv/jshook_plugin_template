# Agent Recipes for `jshook_plugin_template`

> 这份文档面向使用 Codex / Claude 之类 agent 的操作者，说明什么时候该并行，什么时候该把任务交给 subagent。

## 原则

- **并行适合读，不适合改共享页面状态**。
- **subagent 适合作为侧车分析**，不适合接管主浏览器操控。

## Recipe 1：并行读取页面表面信息

适合场景：页面已经打开，你只想快速收集状态。

推荐并行：

- `extensions_list`
- `page_get_local_storage`
- `page_get_cookies`
- `network_get_requests`

示意：

```json
{
  "tool_uses": [
    {
      "recipient_name": "functions.mcp__jshook__extensions_list",
      "parameters": {}
    },
    {
      "recipient_name": "functions.mcp__jshook__page_get_local_storage",
      "parameters": {}
    },
    {
      "recipient_name": "functions.mcp__jshook__page_get_cookies",
      "parameters": {}
    },
    {
      "recipient_name": "functions.mcp__jshook__network_get_requests",
      "parameters": {
        "tail": 20
      }
    }
  ]
}
```

## Recipe 2：主 agent 操控页面，subagent 整理结果

适合场景：主 agent 已经拿到请求与认证线索，但你不想自己整理接口表。

推荐分工：

- 主 agent：
  - `page_navigate`
  - `template_openapi_probe`
  - `network_get_requests`
- subagent：
  - 整理 endpoint matrix
  - 生成 HAR / Markdown 摘要
  - 提炼疑似认证字段

建议思路：

1. 主 agent 保持浏览器会话与登录态。
2. 主 agent 把抓到的请求样本、HAR 路径或 probe 结果发给 subagent。
3. subagent 只做文档化与旁路分析。

## Recipe 3：不要并行这些动作

不推荐并行：

- `page_click` + `page_type`
- 登录操作 + 验证码处理
- 会导致页面导航的多个动作

原因很简单：它们共享同一个页面状态，容易相互打断。

