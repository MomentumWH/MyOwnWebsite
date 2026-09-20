# MyOwnWebsite

一个基于 Vue 3、TypeScript 和 Vite 的个人作品集与前端实验项目。仓库目前包含全局页面助手、阿森纳赛季数据看板、CS 饰品行情、账户与聊天演示，以及若干 UI / 可视化实验页面。

项目不是单一业务产品。它更接近一个持续迭代的应用集合，用来验证页面设计、路由权限、状态持久化、第三方数据接入、图表展示和 AI 页面交互。

## 当前功能

### 全局 Page Agent

页面右下角的 AI 助手挂载在应用顶层，可在不同路由中使用。

- 对接 OpenAI 兼容的 Responses API
- 支持站内导航、页面滚动、返回上一页和读取当前页面概况
- 支持 JPG、PNG、WEBP、GIF 图片输入，单张上限 4 MB
- 服务不可用时，可用本地规则完成常见导航和滚动指令
- 浏览器只执行白名单工具，不允许模型调用任意命令

### 阿森纳赛季看板

路由：`/arsenal-season`

- 从 FPL 官方接口读取本赛季赛程、赛果、难度、Bonus 和 BPS
- 汇总球员黄牌与红牌数据
- 计算比赛行为分：`黄牌数 × -1 + 红牌数 × -3`
- 将开球时间统一显示为北京时间（`Asia/Shanghai`）
- 使用 Football-Data 历史数据补充近三季交锋信息
- 提供赛季走势、比赛分析、下一场预测和赛季积分预测
- 支持在本地保存个人比分预测
- 服务端缓存有效期为 5 分钟；上游失败时可回退到 24 小时内的旧缓存

> 比赛与赛季预测来自本地启发式模型，只用于页面演示，不代表阿森纳、FPL 或数据源的官方观点。

### CS 饰品模块

- `/cs-items`：行情总览、市场指标、趋势图、搜索和热门饰品
- `/item-list`：饰品列表与筛选
- `/CsItemDetail`：饰品详情、磨损切换、多平台价格和历史趋势
- `/inventory-monitor`：库存监控
- `/knife-market`：挂刀行情演示
- `/item-ranking`：饰品排行榜

行情页和详情页通过 CSQAQ 接口读取数据，并包含加载、错误、洞察计算与图表展示。当前挂刀行情页面主要使用静态演示数据，并非实时交易系统。

### 账户与权限

- 本地注册和模拟登录
- Pinia 管理认证状态
- 登录态、注册账户和聊天记录写入 `localStorage`
- 路由守卫支持登录重定向和登录后回跳
- 聊天室在登录之外还校验 `chat-room:access` 权限
- 未匹配路由进入 404 页面

当前认证仅用于前端功能演示，不具备生产环境所需的服务端会话、密码加密与授权能力。

### 实验与展示页面

- Blog：内容型项目展示
- Ecommerce：接口调用、Anime.js 动效和 ECharts 图表演示
- Data Visualization：数据可视化项目展示
- Drag Box：拖拽交互实验
- Pretext Demo：`@chenglou/pretext` 文本测量与排版实验
- SoybeanUI Demo：SoybeanUI 组件与交互演示

Blog 和 Data Visualization 当前是展示页面，不是完整的内容管理或数据平台。

## 技术栈

| 分类 | 主要技术 |
| --- | --- |
| 应用框架 | Vue 3、TypeScript、Vite |
| 路由与状态 | Vue Router、Pinia、localStorage |
| UI 与样式 | Naive UI、SoybeanUI、Sass、vfonts |
| 数据请求 | Axios、vue-request、原生 Fetch |
| 图表与动效 | ECharts、vue-echarts、Anime.js、TypeIt |
| 交互与工具 | VueUse、Lodash、Day.js、Pretext |
| 服务端 | Node.js 原生 HTTP 服务 |
| 质量保障 | Vitest、vue-tsc、ESLint、simple-git-hooks |

仓库还保留 Three.js、VChart 和 Vue VTable 等依赖，用于后续图形与表格实验；它们不一定已在主要页面中完整使用。

## 路由与访问权限

权限由 [src/permissions/Permissions.ts](./src/permissions/Permissions.ts) 统一计算，路由定义位于 [src/router/index.ts](./src/router/index.ts)。

| 访问条件 | 路由 |
| --- | --- |
| 公开 | `/`、`/about`、`/login`、`/register` |
| 公开展示 | `/blog`、`/ecommerce`、`/data-visualization`、`/drag-box` |
| 公开数据页 | `/arsenal-season`、`/cs-items`、`/item-list`、`/CsItemDetail` |
| 需要登录 | `/profile`、`/pretext-demo`、`/soybean-ui-demo` |
| 需要登录 | `/inventory-monitor`、`/knife-market`、`/item-ranking` |
| 登录并需要权限 | `/chat-room` |
| 公开兜底 | 404 页面 |

聊天室权限目前授予 `admin` 角色，以及用户名为 `admin` 或 `Chonny` 的本地账户。

## 项目结构

```text
.
|-- server/
|   |-- page-agent-server.mjs       # Page Agent 与足球数据 HTTP 服务
|   |-- arsenal-season-service.mjs  # FPL 聚合、历史数据与缓存
|   `-- arsenal-season-service.test.mjs
|-- src/
|   |-- components/                 # 通用和业务组件
|   |-- composables/                # CS、图表和页面交互逻辑
|   |-- constants/                  # 统一存储键等常量
|   |-- features/
|   |   |-- arsenal-season/         # 阿森纳数据、预测、组件与测试
|   |   `-- page-agent/             # 页面助手、客户端、工具执行与测试
|   |-- permissions/                # 权限规则与单元测试
|   |-- router/                     # 路由配置
|   |-- services/                   # 通用、Ecommerce 与 CSQAQ 请求层
|   |-- stores/                     # Pinia stores
|   |-- views/                      # account、base、csgo、football、labs
|   `-- main.ts
|-- docs/                           # 规范与历史路线图
|-- .env.example
|-- nginx.conf.example
|-- vite.config.ts
`-- vitest.config.ts
```

## 数据源与接口

| 模块 | 数据源 | 本地入口 | 说明 |
| --- | --- | --- | --- |
| Page Agent | OpenAI 兼容 Responses API | `/api/agent` | API Key 只保存在 Node 服务环境变量中 |
| 阿森纳赛季 | FPL `bootstrap-static`、`fixtures` | `/api/football/arsenal-season` | 无需浏览器直连 FPL |
| 历史交锋 | Football-Data 英超 CSV | 同上 | 由 Node 服务聚合 |
| CS 饰品 | CSQAQ API | `/api/csqaq` | 开发环境由 Vite 代理 |
| Ecommerce Demo | `VITE_API_BASE_URL` | 由环境变量决定 | 示例接口，详见 [API_DEMO.md](./src/services/API_DEMO.md) |

## 环境配置

以 [.env.example](./.env.example) 为模板，根据运行端分别配置。

前端配置可放在 `.env.local`：

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_CSQAQ_API_BASE_URL=/api/csqaq
VITE_CSQAQ_API_TOKEN=
```

Page Agent 服务配置放在 `.env.agent.local`：

```env
AGENT_API_BASE_URL=https://your-openai-compatible-provider.example/v1
AGENT_API_KEY=
AGENT_MODEL=gpt-5.6-sol
AGENT_SERVER_HOST=127.0.0.1
AGENT_SERVER_PORT=8787
```

`VITE_*` 变量会被打包到浏览器代码中，不能视为秘密。生产环境中的 CSQAQ Token 应由服务端代理保护；`AGENT_API_KEY` 不应写入任何 Vite 环境变量。

## 本地开发

准备可运行 Vite 8 的 Node.js 环境，并安装 pnpm。

```bash
pnpm install
```

完整功能需要同时启动 Node 服务和 Vite。终端一：

```bash
pnpm dev:agent
```

终端二：

```bash
pnpm dev
```

默认地址：

- Web 应用：`http://localhost:5999`
- Node 服务：`http://127.0.0.1:8787`

即使未配置 AI 提供商，Node 服务仍用于阿森纳赛季接口；Page Agent 则会在可处理的指令上回退到本地规则。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm dev:agent` | 监听模式启动 Node 服务 |
| `pnpm start:agent` | 非监听模式启动 Node 服务 |
| `pnpm build` | 构建前端 |
| `pnpm build:check` | 类型检查后构建 |
| `pnpm typecheck` | 运行 vue-tsc |
| `pnpm lint` | 检查代码规范 |
| `pnpm lint:fix` | 自动修复可修复的规范问题 |
| `pnpm test` | 运行 Vitest 测试 |
| `pnpm test:watch` | 监听模式运行测试 |
| `pnpm preview` | 预览生产构建 |

## 测试覆盖

当前自动化测试主要覆盖：

- 路由白名单、登录跳转和聊天室权限
- Page Agent 意图解析、客户端协议、图片请求和工具白名单
- 阿森纳赛季数据校验、北京时间转换、积分与行为分计算
- 比赛预测、赛季趋势、个人预测持久化
- Node 端 FPL 数据标准化、缓存与旧数据回退
- CS 市场洞察和单品趋势计算

测试集中在纯逻辑和服务层，尚未覆盖所有 Vue 页面交互，也没有完整的端到端测试。

## 本地持久化

浏览器数据键统一定义在 [src/constants/storage.ts](./src/constants/storage.ts)：

- `auth_token`、`auth_user`：模拟登录状态
- `registered_accounts`：本地注册账户
- `chat-messages`：聊天记录
- `api_token`：Ecommerce 示例接口 Token
- `arsenal-season-cache`：赛季数据与个人预测缓存

清理站点的 localStorage 会同时重置这些本地状态。

## 生产部署

前端构建产物位于 `dist/`，Node 服务可通过 `pnpm start:agent` 单独运行。生产反向代理至少需要：

- 将 `/api/agent` 和 `/api/agent/continue` 转发到 `127.0.0.1:8787`
- 将 `/api/football/` 转发到 `127.0.0.1:8787`
- 在服务端代理 `/api/csqaq` 并安全注入第三方 Token
- 为 Vue Router History 模式保留 `try_files ... /index.html`

[nginx.conf.example](./nginx.conf.example) 已包含静态站点和足球接口的基础配置，但还未完整覆盖 Page Agent 与生产级 CSQAQ 鉴权，部署前需要补齐。

## 当前限制

- 账户、权限和聊天室是浏览器端演示，不适合直接用于生产
- AI 页面助手依赖兼容 Responses API 的模型服务
- FPL、Football-Data 和 CSQAQ 等外部数据源可能受网络、限流或字段变化影响
- 预测结果是启发式估算，不包含完整伤停、临场阵容等实时因素
- 部分实验页面仍以能力展示为主，尚未形成完整业务闭环
- 自动化测试尚未覆盖浏览器端到端流程

## 补充文档

- [代码生成与修改规则](./docs/CODE_GENERATION_RULES.md)
- [项目迭代路线图](./docs/ROADMAP.md)

> 路线图创建较早，其中部分事项已经在当前代码中实现；后续维护时应以源码和本 README 的现状说明为准。
