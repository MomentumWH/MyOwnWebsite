export type PageAgentRole = "agent" | "user";

export interface PageAgentMessage {
  id: string;
  role: PageAgentRole;
  content: string;
  image?: PageAgentMessageImage;
}

export interface PageAgentMessageImage {
  dataUrl: string;
  name: string;
}

export interface PageAgentDestination {
  label: string;
  path: string;
  keywords: readonly string[];
}

export type PageAgentIntent =
  | { type: "navigate"; destination: PageAgentDestination }
  | { type: "scroll"; direction: "top" | "bottom" | "up" | "down" }
  | { type: "back" }
  | { type: "describe" }
  | { type: "help" }
  | { type: "unknown" };

export const PAGE_AGENT_DESTINATIONS: readonly PageAgentDestination[] = [
  { label: "首页", path: "/", keywords: ["首页", "主页", "home"] },
  { label: "关于页面", path: "/about", keywords: ["关于", "about"] },
  { label: "博客", path: "/blog", keywords: ["博客", "blog"] },
  { label: "电商实验", path: "/ecommerce", keywords: ["电商", "商城", "ecommerce"] },
  { label: "数据可视化", path: "/data-visualization", keywords: ["数据可视化", "可视化"] },
  {
    label: "阿森纳赛季走势",
    path: "/arsenal-season",
    keywords: ["阿森纳", "英超", "赛季走势", "比赛预测"],
  },
  { label: "拖拽实验", path: "/drag-box", keywords: ["拖拽", "drag box"] },
  { label: "Pretext Demo", path: "/pretext-demo", keywords: ["pretext"] },
  { label: "SoybeanUI Demo", path: "/soybean-ui-demo", keywords: ["soybean", "soybeanui"] },
  { label: "CS 饰品中心", path: "/cs-items", keywords: ["cs 饰品", "cs饰品", "饰品中心"] },
  { label: "库存监控", path: "/inventory-monitor", keywords: ["库存监控", "库存"] },
  { label: "挂刀行情", path: "/knife-market", keywords: ["挂刀行情", "挂刀"] },
  { label: "饰品排行榜", path: "/item-ranking", keywords: ["饰品排行榜", "排行榜", "排名"] },
  { label: "饰品列表", path: "/item-list", keywords: ["饰品列表", "物品列表"] },
  { label: "个人中心", path: "/profile", keywords: ["个人中心", "个人资料", "profile"] },
  { label: "聊天室", path: "/chat-room", keywords: ["聊天室", "聊天"] },
  { label: "登录", path: "/login", keywords: ["登录", "login"] },
] as const;

const normalizePrompt = (prompt: string) => prompt.trim().toLocaleLowerCase();

const includesAny = (prompt: string, terms: readonly string[]) =>
  terms.some((term) => prompt.includes(term));

export function resolvePageAgentIntent(prompt: string): PageAgentIntent {
  const normalized = normalizePrompt(prompt);

  if (!normalized) {
    return { type: "unknown" };
  }

  if (includesAny(normalized, ["回到顶部", "返回顶部", "滚到顶部", "顶部", "最上面"])) {
    return { type: "scroll", direction: "top" };
  }

  if (includesAny(normalized, ["滚到底部", "页面底部", "最下面", "到底部"])) {
    return { type: "scroll", direction: "bottom" };
  }

  if (includesAny(normalized, ["向下", "往下", "下一屏", "继续浏览"])) {
    return { type: "scroll", direction: "down" };
  }

  if (includesAny(normalized, ["向上", "往上", "上一屏"])) {
    return { type: "scroll", direction: "up" };
  }

  if (includesAny(normalized, ["返回上一页", "回上一页", "后退", "返回前页"])) {
    return { type: "back" };
  }

  if (includesAny(normalized, ["这个页面有什么", "页面有什么", "介绍当前页面", "当前页面", "页面概览"])) {
    return { type: "describe" };
  }

  if (includesAny(normalized, ["你能做什么", "怎么用", "帮助", "help", "能力"])) {
    return { type: "help" };
  }

  const destination = PAGE_AGENT_DESTINATIONS.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword.toLocaleLowerCase())),
  );

  if (destination) {
    return { type: "navigate", destination };
  }

  return { type: "unknown" };
}
