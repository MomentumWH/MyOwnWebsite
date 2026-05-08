# MyOwnWebsite

一个基于 Vue 3 + TypeScript + Vite 的个人前端练习与展示项目。项目不是单一业务站点，而是把个人主页、登录与聊天、实验性页面、以及 CS 饰品数据看板等内容整合在一个单页应用中，用来集中练习界面开发、路由组织、状态管理、图表可视化和接口联调。

## 项目定位

这个项目当前更接近一个“个人作品集合 + 前端实验场”，主要包含四类内容：

- 个人主页与项目导航
- 账号登录、个人中心、聊天房间等交互页面
- Blog / Ecommerce / Data Visualization / Drag Box / Pretext Demo 等实验页面
- 以 CS 饰品行情为主题的数据展示与详情分析页面

## 技术栈

### 核心框架

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia

### UI 与样式

- Naive UI
- Sass
- vfonts
- vfit

### 数据请求与状态

- Axios
- vue-request
- localStorage 持久化

### 可视化与交互

- ECharts
- vue-echarts
- TypeIt
- @chenglou/pretext
- lodash
- dayjs
- @vueuse/core

### 其他已安装依赖

项目中还安装了 `three`、`@visactor/vchart`、`@visactor/vue-vtable`、`vue3-border-beam` 等依赖，当前源码里主要使用的是 ECharts、Naive UI、Pretext、TypeIt、VueUse 这一组能力，其他依赖更偏后续扩展或试验用途。

## 项目结构

```text
src
├─ components       通用组件与页面局部组件
├─ composables      可复用业务逻辑，当前主要用于 CS 饰品详情模块
├─ router           路由配置
├─ services         Axios 实例与接口封装
├─ stores           Pinia 状态管理
├─ views
│  ├─ account       登录、个人中心、聊天房间
│  ├─ base          首页、About
│  ├─ csgo          CS 饰品数据页面
│  └─ labs          实验页面与效果演示
└─ main.ts          应用入口
```

## 主要页面与功能

### 1. 首页 `Home`

首页是整个项目的入口页，包含：

- 个人资料卡片、技能标签、项目经验展示
- `TypeIt` 打字机标题效果
- 雪花粒子背景动画
- 基于 Naive UI 的下拉菜单和按钮交互
- 上传建议入口
- 跳转到各个子页面的导航入口

从源码看，首页承担了“作品集首页 + 子项目导航”的角色。

### 2. 账号系统 `account`

包含以下页面：

- `Login.vue`
  - 本地模拟登录
  - 内置测试账号
  - 登录状态写入 Pinia 与 localStorage
  - 路由守卫支持未登录跳转与重定向
- `Profile.vue`
  - 个人资料展示
  - 基础编辑态 UI
  - 退出登录入口
- `ChatRoom.vue`
  - 聊天消息列表展示
  - 文本、表情、图片消息类型
  - 发送消息
  - 聊天记录持久化到 localStorage

权限控制在 [`src/permission.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/permission.ts) 中实现，`/chat-room` 还带有额外访问控制逻辑。

### 3. 实验页面 `labs`

#### Blog

一个博客项目展示页，主要用于展示：

- 博客系统功能卡片
- 技术栈说明
- Drawer + Carousel 交互效果

#### Ecommerce

一个电商项目展示与接口演示页，包含：

- 电商功能模块展示
- `vue-echarts` 环形图
- 登录请求示例
- 商品列表请求示例
- Naive UI 卡片、列表、抽屉等组件组合

这里更偏“前端页面 + API 调用演示”，并不是完整电商系统。

#### Data Visualization

一个数据可视化项目展示页，主要展示：

- 可视化平台介绍
- 功能模块卡片
- 技术栈卡片
- Drawer + Carousel 展示交互

#### Drag Box

一个简洁的拖拽交互示例，演示：

- 鼠标按下开始拖动
- 监听 `mousemove` / `mouseup`
- 自定义可拖拽面板

#### Pretext Demo

基于 `@chenglou/pretext` 的文本测量演示页，主要展示：

- `prepare()` 与 `layout()` 的基础用法
- 动态调整文本、宽度、行高、字号、字间距
- 对比 DOM 文本预览与预计算结果
- 统计 `prepare` / `layout` 调用次数

这一页是项目里比较明确的“底层排版能力实验”页面。

### 4. CS 饰品数据模块 `csgo`

这是当前项目里内容最完整、业务感最强的一部分。

#### `CSItems.vue`

主要功能包括：

- CS 饰品行情首页布局
- 指数卡片、涨跌信息、市场摘要
- K 线图与趋势图
- 搜索建议
- 排行榜与价格分段展示
- 热门饰品卡片列表
- 自适应缩放布局

这一页综合使用了：

- ECharts
- VueUse
- lodash 防抖
- dayjs
- Naive UI
- 封装后的 CSQAQ 接口

#### `ItemDetail.vue`

详情页提供：

- 饰品基础信息展示
- 多平台价格对比
- 磨损切换
- 不同时间粒度图表切换
- 详情图表渲染

相关逻辑拆分到了：

- [`src/composables/csgo/useItemDetail.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/composables/csgo/useItemDetail.ts)
- [`src/composables/csgo/useItemDetailChart.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/composables/csgo/useItemDetailChart.ts)

#### `ItemList.vue`

该模块还包含饰品列表页，用于承接从首页和搜索进入的列表浏览需求。

## 路由概览

当前路由主要分为 4 组：

- 基础页面：`/`、`/about`
- 账号页面：`/login`、`/profile`、`/chat-room`
- 实验页面：`/blog`、`/ecommerce`、`/data-visualization`、`/drag-box`、`/pretext-demo`
- CS 饰品页面：`/cs-items`、`/item-list`、`/CsItemDetail`

路由定义位于 [`src/router/index.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/router/index.ts)。

## 状态管理

项目当前主要有两个 Pinia Store：

- [`src/stores/auth.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/stores/auth.ts)
  - 管理登录态
  - 保存用户信息和 token
  - 提供聊天房间访问权限判断
- [`src/stores/chat.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/stores/chat.ts)
  - 管理聊天消息
  - 自动同步到 localStorage

## 接口与环境配置

### 通用接口

项目封装了一个通用 Axios 实例：

- [`src/services/api.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/services/api.ts)

主要用于电商演示页中的登录、商品获取等接口调用。

### CSQAQ 数据接口

CS 饰品模块使用了独立的接口封装：

- [`src/services/CSQAQAPI.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/services/CSQAQAPI.ts)
- [`src/services/CSQaQ.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/src/services/CSQaQ.ts)

从源码看，项目通过 `VITE_CSQAQ_API_BASE_URL` 配置接口前缀：

开发环境 `.env`

```env
VITE_CSQAQ_API_BASE_URL=/api/csqaq
```

生产环境 `.env.production`

```env
VITE_CSQAQ_API_BASE_URL=https://api.csqaq.com
```

Vite 开发服务器中还配置了代理：

- `/api/csqaq` -> `https://api.csqaq.com`

配置文件位于 [`vite.config.ts`](/C:/Users/Administrator/Desktop/MyWebsite/MyOwnWebsite/MyOwnWebsite/vite.config.ts)。

## 本地启动

### 安装依赖

项目仓库中同时存在 `pnpm-lock.yaml` 和 `bun.lock`，但脚本配置与钩子更偏向 `pnpm` 使用方式，推荐优先使用 `pnpm`：

```bash
pnpm install
```

### 启动开发环境

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 类型检查

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

## 当前项目特点总结

这个项目的特点不是“单一完整业务闭环”，而是把多个前端练习方向放在同一个 Vue 应用里持续迭代，尤其集中在：

- 动效与视觉表达
- 页面路由组织
- 本地状态与权限控制
- 图表可视化
- 第三方接口联调
- 文本排版与交互实验

如果后续继续完善，比较自然的方向包括：

- 补全 README 中各页面的截图
- 增加统一导航与模块说明
- 梳理实验页和正式业务页的边界
- 统一编码与文案字符集
- 为账号和 CS 饰品模块补测试与错误处理
