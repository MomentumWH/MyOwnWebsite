# Project Roadmap

这个文档用于整理 `MyOwnWebsite` 的后续迭代方向，方便把 README 中较分散的改进建议收敛成更可执行的开发清单。

## 当前阶段判断

从当前源码状态看，项目已经具备以下基础：

- 有完整的 Vue 3 + TypeScript + Vite 工程结构
- 已接入路由、状态管理、基础权限守卫
- 有多个独立页面和实验模块
- 已接入图表、接口调用、文本排版实验能力
- 已具备作品集展示属性

当前更适合进入“整理结构、统一规范、补齐展示和质量保障”的阶段，而不是继续无序加页面。

## 迭代优先级

建议按下面顺序推进：

1. 修复文案和编码问题
2. 补齐 README 展示材料
3. 统一导航和信息架构
4. 整理接口层与状态层
5. 提升 CS 饰品模块稳定性
6. 补测试和工程约束

## P0

P0 表示优先级最高，适合先做。

### 1. 修复乱码与文案不统一

目标：

- 修复当前部分页面中的中文乱码问题
- 统一按钮文案、页面标题、提示文案
- 清理中英文混用过于随意的地方

涉及区域：

- `src/views/base/Home.vue`
- `src/views/account/Login.vue`
- `src/views/account/Profile.vue`
- `src/views/account/ChatRoom.vue`
- `src/views/labs/Blog.vue`
- `src/views/labs/DataVisualization.vue`
- `src/views/labs/PretextDemo.vue`
- `src/views/csgo/*`

完成标准：

- 主要页面中文显示正常
- README 中提到的核心页面文案风格统一

### 2. 补页面截图

目标：

- 提升仓库可读性和展示效果
- 让 README 真正具备作品集首页价值

建议目录：

```text
docs/screenshots/
```

建议先补这些页面：

- `home.png`
- `login.png`
- `chat-room.png`
- `pretext-demo.png`
- `cs-items.png`
- `item-detail.png`

完成标准：

- README “页面预览”区块能正常显示核心截图

## P1

P1 表示重要，但可以放在 P0 之后。

### 3. 统一导航结构

目标：

- 让项目从“页面集合”变成“结构清晰的网站”

建议方向：

- 增加全局导航入口
- 为 `labs` 和 `csgo` 模块建立清晰分组
- 为每个页面增加统一返回逻辑
- 增加 404 页面

完成标准：

- 用户可以不依赖首页卡片，也能在站内完成主要跳转

### 4. 梳理权限和登录逻辑

目标：

- 明确 mock 登录和真实接口登录的边界
- 避免 token 存储不一致

建议方向：

- 统一 localStorage 中 token key
- 统一 `auth store` 与 Axios 拦截器读取的字段
- 将测试账号逻辑收拢到单独的 mock/auth 层

完成标准：

- 登录态读写来源唯一
- 路由守卫与接口拦截器使用同一套字段约定

### 5. 整理接口和类型

目标：

- 降低 `any`
- 提升服务层可维护性

建议方向：

- 为 `src/services/apiCalls.ts` 增加响应类型
- 为 `src/services/CSQaQ.ts` 中高频接口补类型
- 给 CS 饰品详情、列表、图表数据建立独立 `types`

完成标准：

- 主要接口返回值不再依赖裸 `any`

## P2

P2 表示中长期持续优化项。

### 6. 优化 CS 饰品模块组件边界

目标：

- 降低单文件复杂度
- 提高复用性

建议方向：

- 拆出搜索框组件
- 拆出行情卡片组件
- 拆出排行榜组件
- 拆出平台价格对比组件
- 拆出图表外壳组件

完成标准：

- `CSItems.vue` 和 `ItemDetail.vue` 的职责更聚焦

### 7. 建立基础测试

目标：

- 给关键逻辑增加回归保障

建议方向：

- store 测试
- 权限守卫测试
- composable 测试
- 登录流程 E2E
- 聊天室消息流 E2E

完成标准：

- 至少覆盖一条登录主流程和一条 CS 饰品主流程

### 8. 统一视觉主题

目标：

- 让各模块从“各自设计”逐渐过渡到“同站风格”

建议方向：

- 提炼全局色板
- 统一按钮风格
- 统一卡片半径、阴影、间距
- 为图表建立统一主题色

完成标准：

- 首页、实验页、CS 模块之间的视觉割裂感降低

## 文档计划

后续建议补这些文档：

- `docs/ROADMAP.md`
- `docs/screenshots/README.md`
- `docs/pretext-demo.md`
- `docs/csgo-module.md`

## 完成状态模板

后续可以按下面格式维护进度：

```md
## Done

- 修复 Login 页面中文乱码
- 补充首页截图和聊天室截图

## In Progress

- 统一 token 存储逻辑

## Todo

- 为 CS 饰品详情页补接口类型
- 为聊天模块补测试
```
