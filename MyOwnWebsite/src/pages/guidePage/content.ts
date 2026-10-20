export interface GuideSection {
  title: string;
  text: string;
  items?: readonly string[];
}

export interface GuideArticle {
  id: string;
  category: "开始使用" | "功能教程" | "帮助与支持";
  title: string;
  description: string;
  duration: string;
  sections: readonly GuideSection[];
  tip?: string;
  links: readonly { label: string; path: string; description: string }[];
  questions?: readonly { question: string; answer: string }[];
}

// 教程正文集中在此维护；新增条目后会自动出现在目录和全文搜索中。
export const guideArticles: readonly GuideArticle[] = [
  {
    id: "quick-start",
    category: "开始使用",
    title: "第一次使用，从这里开始",
    description: "认识 Chonny Lab，用三个步骤找到你需要的功能。",
    duration: "3 分钟",
    sections: [
      {
        title: "选择你感兴趣的模块",
        text: "Chonny Lab 汇集了饰品行情、足球赛季数据和前端交互实验。通过顶部导航，可以在各个主要模块之间切换。",
        items: [
          "关注 CS 饰品：进入「CS饰品数据」，查看行情总览与单品信息。",
          "关注阿森纳：进入「阿森纳赛季」，浏览赛程、赛果和趋势预测。",
          "探索项目：进入个人博客、电商平台或数据可视化页面，了解不同的界面与交互演示。",
        ],
      },
      {
        title: "先浏览，再按需登录",
        text: "教程中心、饰品行情总览、饰品列表、饰品详情和阿森纳赛季看板均可直接浏览。访问库存监控、挂刀行情、饰品排行榜、个人中心等页面时，系统会引导你登录。",
      },
      {
        title: "让页面助手带你探索",
        text: "点击右下角的 AI 助手，试着输入「打开饰品列表」或「介绍当前页面」。也可以通过本教程的章节目录，继续了解各模块的具体用法。",
      },
    ],
    tip: "本教程可直接分享。每个章节都有独立链接，复制浏览器地址即可让其他人打开相同内容，无需登录。",
    links: [
      {
        label: "浏览饰品行情",
        path: "/cs-items",
        description: "市场指数、趋势与热门饰品",
      },
      {
        label: "查看阿森纳赛季",
        path: "/arsenal-season",
        description: "赛程、赛果与赛季走势",
      },
    ],
  },
  {
    id: "market",
    category: "功能教程",
    title: "查看 CS 饰品行情",
    description: "从市场总览出发，了解如何搜索饰品、查看价格与历史趋势。",
    duration: "4 分钟",
    sections: [
      {
        title: "浏览市场总览",
        text: "打开「CS饰品数据」，先查看饰品指数、市场指标和趋势图，再结合热门系列了解当前市场。接口数据需要加载，请留意页面的加载与错误提示。",
      },
      {
        title: "查找感兴趣的饰品",
        text: "在行情页使用搜索框输入饰品名称，选择搜索建议；也可以打开「饰品列表」，使用页面提供的分类与筛选条件浏览。",
      },
      {
        title: "阅读单品详情",
        text: "点击饰品进入详情页，查看属性、价格变化、多平台价格和历史趋势。对于支持多种磨损的饰品，可以切换磨损选项后比较数据。",
        items: [
          "比较价格前，先确认饰品名称、磨损和特殊版本是否一致。",
          "结合历史趋势查看涨跌，避免只根据单次变化判断行情。",
          "部分列表与行情模块包含演示数据，展示信息不代表实时成交结果。",
        ],
      },
    ],
    tip: "行情依赖外部数据接口。遇到加载失败时，可稍后重新打开页面；教程本身不依赖行情接口。",
    links: [
      { label: "行情总览", path: "/cs-items", description: "了解市场整体变化" },
      {
        label: "饰品列表",
        path: "/item-list",
        description: "按分类查找具体饰品",
      },
    ],
  },
  {
    id: "season",
    category: "功能教程",
    title: "阅读阿森纳赛季看板",
    description: "查看比赛记录、赛季走势，以及下一场比赛的预测信息。",
    duration: "3 分钟",
    sections: [
      {
        title: "选择赛事并查看概况",
        text: "进入「阿森纳赛季」，通过赛事选项切换英超或欧冠。先查看概况和数据更新时间，再阅读当前赛事的赛程与赛果。比赛时间按北京时间显示。",
      },
      {
        title: "结合走势阅读比赛记录",
        text: "通过比赛筛选定位已赛或未赛场次，结合赛季走势图了解近期表现。不同赛事的数据覆盖范围有所不同；黄牌、红牌与比赛行为分应结合页面实际提供的数据阅读。",
      },
      {
        title: "查看预测与记录个人判断",
        text: "在预测区域查看下一场比赛分析，并使用比分预测功能记录自己的判断。个人预测保存在当前浏览器中，可在后续访问时继续查看。",
      },
    ],
    tip: "预测是用于展示的模型估算。若页面提示正在使用缓存，请结合数据更新时间阅读；清除浏览器站点数据会移除本地保存的个人预测。",
    links: [
      {
        label: "打开赛季看板",
        path: "/arsenal-season",
        description: "查看最新赛程与走势",
      },
    ],
  },
  {
    id: "assistant",
    category: "功能教程",
    title: "使用 AI 页面助手",
    description: "用自然语言完成站内导航、页面滚动和当前页面介绍。",
    duration: "2 分钟",
    sections: [
      {
        title: "打开右下角的助手",
        text: "页面助手会出现在各个路由中。点击悬浮入口展开对话，输入你想完成的操作。",
      },
      {
        title: "试试这些指令",
        text: "从简短、明确的操作开始。助手执行站内导航时，仍会遵守目标页面的登录与权限要求。",
        items: [
          "「打开饰品列表」——跳转到饰品列表页面。",
          "「打开教程中心」——返回系统使用教程。",
          "「介绍当前页面」——了解当前页面展示的内容。",
          "「向下滚动」「回到顶部」「返回上一页」——辅助浏览页面。",
        ],
      },
      {
        title: "按需添加图片",
        text: "对话支持 JPG、PNG、WEBP、GIF 图片，单张不超过 4 MB。图片理解需要模型服务可用；服务暂时不可用时，部分导航与滚动指令仍可由本地规则处理。",
      },
    ],
    links: [],
  },
  {
    id: "account",
    category: "开始使用",
    title: "账户、登录与访问权限",
    description: "了解哪些功能需要登录，以及登录后如何继续访问目标页面。",
    duration: "3 分钟",
    sections: [
      {
        title: "注册本地演示账户",
        text: "进入注册页，填写用户名、邮箱、密码和确认密码，并完成人机验证。密码至少需要 6 位。注册后，在同一浏览器中使用该账户登录。",
      },
      {
        title: "访问需要登录的功能",
        text: "未登录时打开受保护页面，系统会跳转到登录页并记录原来的访问地址。登录成功后会返回目标页面。",
        items: [
          "需要登录：个人中心、库存监控、挂刀行情、饰品排行榜、Pretext Demo、SoybeanUI Demo。",
          "聊天室：除登录外，还需要额外的聊天室访问权限。",
          "无需登录：教程中心、首页、公开项目展示、饰品行情与列表详情、阿森纳赛季看板。",
        ],
      },
      {
        title: "了解账户的保存方式",
        text: "当前账户和登录状态用于前端演示，保存在浏览器本地。更换浏览器或清除站点数据后，原来的本地账户和登录状态不会自动恢复。",
      },
    ],
    tip: "注册仅用于体验功能，请使用专门的演示密码。当前系统没有跨设备账户同步功能。",
    links: [
      { label: "注册账户", path: "/register", description: "创建本地演示账户" },
      {
        label: "前往个人中心",
        path: "/profile",
        description: "未登录时将引导登录",
      },
    ],
  },
  {
    id: "faq",
    category: "帮助与支持",
    title: "常见问题与排查",
    description: "关于访问权限、数据加载和本地记录的常见解答。",
    duration: "2 分钟",
    sections: [],
    questions: [
      {
        question: "查看教程需要注册或登录吗？",
        answer:
          "不需要。教程中心及所有教程章节均为公开内容，可以直接打开，也可以复制章节地址分享。",
      },
      {
        question: "为什么点击某些功能后会跳到登录页？",
        answer:
          "库存监控、挂刀行情、饰品排行榜、个人中心等功能需要登录。完成登录后会返回原来想访问的页面；聊天室还会检查额外的访问权限。",
      },
      {
        question: "行情或比赛数据一直加载失败怎么办？",
        answer:
          "先检查网络并稍后重试。行情和比赛数据来自外部接口，可能受服务状态或限流影响；赛季看板可能展示之前缓存的数据，请留意更新时间和缓存提示。",
      },
      {
        question: "为什么换了浏览器后账户、聊天或个人预测不见了？",
        answer:
          "这些记录保存在原浏览器的本地存储中，目前不会跨浏览器或跨设备同步。清除站点数据也会删除这些记录。",
      },
      {
        question: "AI 助手不可用时还能浏览页面吗？",
        answer:
          "可以。你可以继续使用页面导航和按钮；部分简单的助手导航、滚动指令也支持本地规则处理。需要模型理解的对话和图片功能则依赖服务恢复。",
      },
      {
        question: "如何把某篇教程分享给别人？",
        answer:
          "先在左侧目录选择章节，再复制浏览器地址。地址中的章节标识会保留，接收者打开后会直接看到对应教程。",
      },
    ],
    links: [
      { label: "返回首页", path: "/", description: "继续探索 Chonny Lab" },
    ],
  },
];

export const guideCategories = ["开始使用", "功能教程", "帮助与支持"] as const;

export function searchGuideArticles(query: string): readonly GuideArticle[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return guideArticles.filter((article) => {
    const text = [
      article.title,
      article.description,
      article.category,
      article.tip,
      ...article.sections.flatMap((section) => [
        section.title,
        section.text,
        ...(section.items ?? []),
      ]),
      ...(article.questions ?? []).flatMap((item) => [
        item.question,
        item.answer,
      ]),
      ...article.links.flatMap((link) => [link.label, link.description]),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
