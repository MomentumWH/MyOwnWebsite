<script setup lang="ts">
import {
  AlbumsOutline,
  BarChartOutline,
  CalendarOutline,
  EllipsisHorizontal,
  HomeOutline,
  ListOutline,
  PauseOutline,
  SearchOutline,
  TrashOutline,
  TrophyOutline,
} from "@vicons/ionicons5";
import { computed, shallowRef, watch } from "vue";
import { getTaskAll, getTaskBusiness, getTaskList } from "@/services/CSQaQ";

interface NavItem {
  label: string;
  key: string;
  icon: unknown;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  count: number;
  status: "tradable" | "storage";
  changedAt: string;
  action: "recover" | "sell";
  image: string;
  wear: string;
  price: number;
  rarityTone: "blue" | "green" | "orange" | "purple" | "gray";
}

interface MonitorTask {
  id: number;
  steam_name: string;
  steam_id: string;
  amount: number;
  subs: number;
  sum_value: number;
  avatar: string;
  traded_at: string;
}

interface TaskListResponse {
  code?: number;
  msg?: string;
  data?: MonitorTask[] | {
    res?: MonitorTask[];
    total?: number;
  };
}

interface TaskBusinessItem {
  good_id: number;
  market_name: string;
  icon_url: string;
  type: number;
  created_at: string;
}

interface TaskAllItem {
  created_at?: string | null;
  exter_name?: string | null;
  good_id?: number | string;
  gp_name?: string | null;
  icon_url?: string | null;
  market_name?: string | null;
  name?: string | null;
  num?: number | string;
  price?: number | string;
  rarity_name?: string | null;
  tradable?: number | string;
  type?: number | string;
  type_name?: string | null;
}

interface DisplayCategoryShare {
  name: string;
  valueRate: number;
  countRate: number;
}

interface CategoryShareStat {
  count: number;
  value: number;
}

interface TaskBusinessResponse {
  code?: number;
  msg?: string;
  data?: {
    page_index?: number;
    page_size?: number;
    total?: number;
    trades?: TaskBusinessItem[];
  };
}

interface TaskAllResponse {
  code?: number;
  msg?: string;
  data?: TaskAllItem[] | {
    page_index?: number;
    page_size?: number;
    total?: number;
    data?: TaskAllItem[];
    inventory?: TaskAllItem[];
    list?: TaskAllItem[];
    goods?: TaskAllItem[];
    res?: TaskAllItem[];
    rows?: TaskAllItem[];
  };
}

type TaskAllResponsePayload = TaskAllResponse | TaskAllItem[] | {
  data?: TaskAllResponse;
  result?: TaskAllItem[] | TaskAllResponse["data"];
  records?: TaskAllItem[];
  total?: number;
};

const navItems: NavItem[] = [
  { label: "首页", key: "home", icon: HomeOutline },
  { label: "饰品列表", key: "items", icon: ListOutline },
  { label: "排行榜单", key: "ranking", icon: TrophyOutline },
  { label: "库存监控", key: "inventory", icon: AlbumsOutline },
  { label: "挂刀行情", key: "knife", icon: CalendarOutline },
  { label: "热门系列", key: "series", icon: BarChartOutline },
];

const activeNav = shallowRef("inventory");
const activeTab = shallowRef<"dynamic" | "all">("dynamic");
const selectedType = shallowRef("全部类型");
const searchKeyword = shallowRef("");
const taskSearchKeyword = shallowRef("");
const taskSearchLoading = shallowRef(false);
const taskSearchError = shallowRef("");
const taskSearchTouched = shallowRef(false);
const taskSearchResults = shallowRef<MonitorTask[]>([]);
const taskSearchTotal = shallowRef(0);
const selectedMonitorTask = shallowRef<MonitorTask | null>(null);
const taskBusinessLoading = shallowRef(false);
const taskBusinessError = shallowRef("");
const taskBusinessItems = shallowRef<TaskBusinessItem[]>([]);
const taskBusinessTotal = shallowRef(0);
const taskBusinessPageIndex = shallowRef(1);
const taskBusinessPageSize = 10;
const taskAllLoading = shallowRef(false);
const taskAllError = shallowRef("");
const taskAllItems = shallowRef<TaskAllItem[]>([]);
const taskAllTotal = shallowRef(0);
const taskAllPageIndex = shallowRef(1);
const taskAllPageSize = 16;

const inventoryCategoryOrder = [
  "步枪",
  "手套",
  "武器箱",
  "手枪",
  "微型冲锋枪",
  "音乐盒",
  "印花",
  "狙击步枪",
  "挂件",
  "霰弹枪",
  "机枪",
] as const;

const inventoryCategorySet = new Set<string>(inventoryCategoryOrder);

const categoryKeywordMap: Array<{ category: string; keywords: string[] }> = [
  { category: "步枪", keywords: ["AK-47", "M4A4", "M4A1-S", "FAMAS", "Galil AR", "AUG", "SG 553"] },
  { category: "手套", keywords: ["手套", "Gloves", "Wraps"] },
  { category: "武器箱", keywords: ["武器箱", "Case"] },
  { category: "手枪", keywords: ["Glock-18", "USP-S", "P2000", "P250", "Desert Eagle", "Five-SeveN", "Tec-9", "CZ75-Auto", "R8 Revolver", "Dual Berettas"] },
  { category: "微型冲锋枪", keywords: ["MAC-10", "MP9", "MP7", "MP5-SD", "UMP-45", "P90", "PP-Bizon"] },
  { category: "音乐盒", keywords: ["音乐盒", "Music Kit"] },
  { category: "印花", keywords: ["印花", "Sticker"] },
  { category: "狙击步枪", keywords: ["AWP", "SSG 08", "SCAR-20", "G3SG1"] },
  { category: "挂件", keywords: ["挂件", "Charm"] },
  { category: "霰弹枪", keywords: ["Nova", "XM1014", "MAG-7", "Sawed-Off"] },
  { category: "机枪", keywords: ["M249", "Negev"] },
];

const toNumber = (value: number | string | undefined, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const createInventoryItemId = (item: TaskAllItem, index: number) => {
  return [item.good_id, item.market_name, item.created_at, index].filter(Boolean).join("-") || `inventory-${index}`;
};

const resolveInventoryCategory = (name: string, category?: string | null) => {
  const safeCategory = category?.trim();
  const matchedCategory = inventoryCategoryOrder.find(item => safeCategory?.includes(item));

  if (matchedCategory) {
    return matchedCategory;
  }

  const matchedByKeyword = categoryKeywordMap.find(item => item.keywords.some(keyword => name.includes(keyword)));

  if (matchedByKeyword) {
    return matchedByKeyword.category;
  }

  return safeCategory || "其他";
};

const mapTaskAllItemToInventoryItem = (item: TaskAllItem, index: number): InventoryItem => {
  const type = toNumber(item.type);
  const tradable = toNumber(item.tradable);
  const count = Math.max(toNumber(item.num, 1), 1);
  const price = toNumber(item.price);
  const name = item.market_name || item.name || item.gp_name || "未知饰品";
  const category = resolveInventoryCategory(name, item.gp_name || item.type_name);
  const wear = item.exter_name || item.rarity_name || item.gp_name || item.type_name || getBusinessTypeLabel(type);

  return {
    id: createInventoryItemId(item, index),
    name,
    category,
    count,
    status: tradable === 1 ? "tradable" : "storage",
    changedAt: formatTaskTime(item.created_at),
    action: [2, 3, 7].includes(type) ? "sell" : "recover",
    image: normalizeSteamImageUrl(item.icon_url),
    wear,
    price,
    rarityTone: getInventoryRarityTone(item.rarity_name, tradable),
  };
};

const inventoryItems = computed<InventoryItem[]>(() => {
  if (!selectedMonitorTask.value) {
    return [];
  }

  if (activeTab.value === "all") {
    return taskAllItems.value.map(mapTaskAllItemToInventoryItem);
  }

  return taskBusinessItems.value.map((item, index) => ({
    id: `business-${item.good_id}-${item.created_at}-${index}`,
    name: item.market_name,
    category: resolveInventoryCategory(item.market_name),
    count: 1,
    status: "tradable",
    changedAt: formatTaskTime(item.created_at),
    action: item.type === 4 ? "sell" : "recover",
    image: item.icon_url,
    wear: getBusinessTypeLabel(item.type),
    price: 0,
    rarityTone: item.type === 4 ? "orange" : "green",
  }));
});

const categoryShares = computed<DisplayCategoryShare[]>(() => {
  if (!selectedMonitorTask.value || !inventoryItems.value.length) {
    return [];
  }

  const totalCount = inventoryItems.value.reduce((total, item) => total + item.count, 0);
  const totalValue = inventoryItems.value.reduce((total, item) => total + item.price * item.count, 0);
  const categoryStats = inventoryItems.value.reduce<Record<string, CategoryShareStat>>((result, item) => {
    const name = inventoryCategorySet.has(item.category) ? item.category : "其他";
    const current = result[name] ?? { count: 0, value: 0 };
    current.count += item.count;
    current.value += item.price * item.count;
    result[name] = current;
    return result;
  }, {});

  return inventoryCategoryOrder.map((name) => {
    const stat = categoryStats[name] ?? { count: 0, value: 0 };

    return {
      name,
      valueRate: totalValue ? (stat.value / totalValue) * 100 : 0,
      countRate: totalCount ? (stat.count / totalCount) * 100 : 0,
    };
  });
});

const filteredItems = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) {
    return inventoryItems.value;
  }

  return inventoryItems.value.filter(item => item.name.toLowerCase().includes(keyword));
});

const taskAllPageTotal = computed(() => {
  return Math.max(Math.ceil(filteredItems.value.length / taskAllPageSize), 1);
});

const taskAllPageRange = computed(() => {
  if (!filteredItems.value.length) {
    return "0-0";
  }

  const start = (taskAllPageIndex.value - 1) * taskAllPageSize + 1;
  const end = Math.min(taskAllPageIndex.value * taskAllPageSize, filteredItems.value.length);
  return `${start}-${end}`;
});

const pagedTaskAllItems = computed(() => {
  const start = (taskAllPageIndex.value - 1) * taskAllPageSize;
  return filteredItems.value.slice(start, start + taskAllPageSize);
});

const inventoryStats = computed(() => {
  const visibleCount = filteredItems.value.reduce((total, item) => total + item.count, 0);
  const allTotalCount = inventoryItems.value.reduce((total, item) => total + item.count, 0);
  const allTotalValue = inventoryItems.value.reduce((total, item) => total + item.price * item.count, 0);

  return {
    total: inventoryItems.value.length,
    visible: filteredItems.value.length,
    value: activeTab.value === "all"
      ? formatTaskValue(allTotalValue)
      : selectedMonitorTask.value ? formatTaskValue(selectedMonitorTask.value.sum_value) : "--",
    totalCount: activeTab.value === "all" ? allTotalCount : selectedMonitorTask.value?.amount ?? 0,
    visibleCount: activeTab.value === "all" ? visibleCount : selectedMonitorTask.value?.amount ?? 0,
    changed: selectedMonitorTask.value ? formatTaskTime(selectedMonitorTask.value.traded_at) : "--",
    subscribers: selectedMonitorTask.value?.subs ?? 0,
    hasTask: Boolean(selectedMonitorTask.value),
  };
});

const monitorTaskStats = computed(() => ({
  value: selectedMonitorTask.value ? formatTaskValue(selectedMonitorTask.value.sum_value) : "--",
  totalCount: selectedMonitorTask.value?.amount ?? 0,
  visibleCount: selectedMonitorTask.value?.amount ?? 0,
  changed: selectedMonitorTask.value ? formatTaskTime(selectedMonitorTask.value.traded_at) : "--",
  subscribers: selectedMonitorTask.value?.subs ?? 0,
}));

const taskBusinessPageTotal = computed(() => {
  return Math.max(Math.ceil(taskBusinessTotal.value / taskBusinessPageSize), 1);
});

const taskBusinessPageRange = computed(() => {
  if (!taskBusinessTotal.value) {
    return "0-0";
  }

  const start = (taskBusinessPageIndex.value - 1) * taskBusinessPageSize + 1;
  const end = Math.min(taskBusinessPageIndex.value * taskBusinessPageSize, taskBusinessTotal.value);
  return `${start}-${end}`;
});

const formatPrice = (price: number) => toNumber(price).toFixed(2);

const formatTaskTime = (time?: string) => {
  return time ? time.replace("T", " ").replace(/\.\d+Z?$/, "") : "暂无记录";
};

const formatTaskValue = (value: number) => {
  return `¥${value.toFixed(2)}`;
};

const normalizeSteamImageUrl = (iconUrl?: string | null) => {
  if (!iconUrl) {
    return "";
  }

  if (iconUrl.startsWith("http")) {
    return iconUrl;
  }

  return `https://community.cloudflare.steamstatic.com/economy/image/${iconUrl}`;
};

const getInventoryRarityTone = (rarityName?: string | null, tradable = 0): InventoryItem["rarityTone"] => {
  const safeRarityName = rarityName ?? "";

  if (!tradable) {
    return "gray";
  }

  if (safeRarityName.includes("非凡") || safeRarityName.includes("隐秘") || safeRarityName.includes("奇异")) {
    return "orange";
  }

  if (safeRarityName.includes("保密") || safeRarityName.includes("卓越")) {
    return "purple";
  }

  if (safeRarityName.includes("受限") || safeRarityName.includes("工业")) {
    return "blue";
  }

  return "green";
};

const resolveTaskListData = (response: TaskListResponse) => {
  if (Array.isArray(response.data)) {
    return {
      list: response.data,
      total: response.data.length,
    };
  }

  const list = response.data?.res ?? [];
  return {
    list,
    total: response.data?.total ?? list.length,
  };
};

const getBusinessTypeLabel = (type: number | string | undefined) => {
  const normalizedType = toNumber(type);
  const typeMap: Record<number, string> = {
    0: "默认库存",
    1: "买入",
    2: "卖出",
    3: "存入",
    4: "取出",
    5: "CD恢复",
    6: "取出/恢复",
    7: "卖出/存入",
  };

  return typeMap[normalizedType] ?? `类型 ${normalizedType}`;
};

const extractTaskAllList = (payload: unknown): TaskAllItem[] => {
  if (Array.isArray(payload)) {
    return payload as TaskAllItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as TaskAllResponsePayload;

  return extractTaskAllList(data.data)
    .concat(extractTaskAllList(data.result))
    .concat(extractTaskAllList(data.records))
    .concat(extractTaskAllList("inventory" in data ? data.inventory : undefined))
    .concat(extractTaskAllList("list" in data ? data.list : undefined))
    .concat(extractTaskAllList("goods" in data ? data.goods : undefined))
    .concat(extractTaskAllList("res" in data ? data.res : undefined))
    .concat(extractTaskAllList("rows" in data ? data.rows : undefined));
};

const resolveTaskAllData = (response: TaskAllResponsePayload) => {
  const list = extractTaskAllList(response);

  if (list.length) {
    return {
      list,
      total: (response as { total?: number }).total ?? list.length,
    };
  }

  return {
    list,
    total: 0,
  };
};

const loadTaskAll = async () => {
  if (!selectedMonitorTask.value) {
    return;
  }

  if (taskAllItems.value.length || taskAllLoading.value) {
    return;
  }

  taskAllLoading.value = true;
  taskAllError.value = "";

  try {
    const response = await getTaskAll({
      page_index: 1,
      page_size: 100,
      task_id: selectedMonitorTask.value.id,
    }) as TaskAllResponsePayload;

    const taskAllData = resolveTaskAllData(response);
    taskAllItems.value = taskAllData.list;
    taskAllTotal.value = taskAllData.total;
  } catch (error) {
    taskAllError.value = "获取该用户全部库存失败，请稍后重试";
    console.error("获取全部库存失败:", error);
  } finally {
    taskAllLoading.value = false;
  }
};

const handleActiveTabChange = async (tab: "dynamic" | "all") => {
  activeTab.value = tab;
  searchKeyword.value = "";
  taskAllPageIndex.value = 1;

  if (tab === "all") {
    await loadTaskAll();
  }
};

const loadTaskBusiness = async (task: MonitorTask, pageIndex = 1) => {
  const isSameTask = selectedMonitorTask.value?.id === task.id;
  selectedMonitorTask.value = task;
  activeTab.value = "dynamic";
  taskBusinessPageIndex.value = pageIndex;
  taskAllPageIndex.value = 1;
  taskBusinessLoading.value = true;
  taskBusinessError.value = "";
  taskBusinessItems.value = [];

  if (!isSameTask || pageIndex === 1) {
    taskBusinessTotal.value = 0;
  }

  if (!isSameTask) {
    taskAllItems.value = [];
    taskAllTotal.value = 0;
    taskAllError.value = "";
  }

  try {
    const response = await getTaskBusiness({
      page_index: pageIndex,
      page_size: taskBusinessPageSize,
      task_id: task.id,
      search: "",
      type: "ALL",
    }) as TaskBusinessResponse;

    taskBusinessItems.value = response.data?.trades ?? [];
    taskBusinessTotal.value = response.data?.total ?? taskBusinessItems.value.length;
  } catch (error) {
    taskBusinessError.value = "获取该用户库存动态失败，请稍后重试";
    console.error("获取库存动态失败:", error);
  } finally {
    taskBusinessLoading.value = false;
  }
};

const changeTaskBusinessPage = async (direction: "prev" | "next") => {
  if (!selectedMonitorTask.value || taskBusinessLoading.value) {
    return;
  }

  const nextPageIndex = direction === "prev"
    ? taskBusinessPageIndex.value - 1
    : taskBusinessPageIndex.value + 1;

  if (nextPageIndex < 1 || nextPageIndex > taskBusinessPageTotal.value) {
    return;
  }

  await loadTaskBusiness(selectedMonitorTask.value, nextPageIndex);
};

const changeTaskAllPage = (direction: "prev" | "next") => {
  const nextPageIndex = direction === "prev"
    ? taskAllPageIndex.value - 1
    : taskAllPageIndex.value + 1;

  if (nextPageIndex < 1 || nextPageIndex > taskAllPageTotal.value) {
    return;
  }

  taskAllPageIndex.value = nextPageIndex;
};

watch(searchKeyword, () => {
  if (activeTab.value === "all") {
    taskAllPageIndex.value = 1;
  }
});

const searchMonitorTasks = async () => {
  taskSearchTouched.value = true;
  taskSearchLoading.value = true;
  taskSearchError.value = "";

  try {
    const response = await getTaskList({
      page_index: 1,
      page_size: 10,
      order: "HOT",
      search: taskSearchKeyword.value.trim(),
    }) as TaskListResponse;

    const taskListData = resolveTaskListData(response);
    taskSearchResults.value = taskListData.list;
    taskSearchTotal.value = taskListData.total;
    selectedMonitorTask.value = null;
    taskBusinessItems.value = [];
    taskBusinessTotal.value = 0;
    taskBusinessError.value = "";
  } catch (error) {
    taskSearchResults.value = [];
    taskSearchTotal.value = 0;
    taskSearchError.value = "搜索库存监控任务失败，请稍后重试";
    console.error("搜索库存监控任务失败:", error);
  } finally {
    taskSearchLoading.value = false;
  }
};
</script>

<template>
  <main class="inventory-monitor-page">
    <nav class="top-nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ 'nav-item--active': activeNav === item.key }"
        @click="activeNav = item.key"
      >
        <component :is="item.icon" class="nav-icon" />
        <span>{{ item.label }}</span>
      </button>
      <button class="nav-item nav-item--more" aria-label="更多">
        <EllipsisHorizontal class="nav-icon" />
      </button>
      <label class="global-search">
        <SearchOutline class="search-icon" />
        <input placeholder="搜索饰品名称，用 / 键快捷搜索~" />
      </label>
    </nav>

    <section class="task-search-card panel-card">
      <div class="task-search-copy">
        <span class="eyebrow">Monitor Task Search</span>
        <h2>搜索库存监控任务</h2>
        <p>调用 CSQAQ 的 <strong>/api/v1/monitor/get_task_list</strong> 接口，支持按 Steam 名称或 SteamID 模糊搜索。</p>
      </div>
      <form class="task-search-form" @submit.prevent="searchMonitorTasks">
        <label class="task-search-input">
          <SearchOutline class="search-icon" />
          <input v-model="taskSearchKeyword" placeholder="输入 Steam 名称或 SteamID，例如 SF90XX" />
        </label>
        <button class="task-search-button" :disabled="taskSearchLoading">
          {{ taskSearchLoading ? "搜索中..." : "搜索任务" }}
        </button>
      </form>

      <div v-if="taskSearchError" class="task-search-message task-search-message--error">
        {{ taskSearchError }}
      </div>

      <div v-else-if="taskSearchTouched" class="task-result-panel">
        <div class="task-result-head">
          <span>搜索结果</span>
          <strong>{{ taskSearchTotal }} 个任务</strong>
        </div>

        <div v-if="taskSearchLoading" class="task-search-message">正在从接口获取库存监控任务...</div>
        <div v-else-if="!taskSearchResults.length" class="task-search-message">暂无匹配任务，请换个关键词试试。</div>
        <div v-else class="task-result-list">
          <button
            v-for="task in taskSearchResults"
            :key="task.id"
            type="button"
            class="task-result-item"
            :class="{ 'task-result-item--active': selectedMonitorTask?.id === task.id }"
            @click="loadTaskBusiness(task)"
          >
            <img class="task-avatar" :src="task.avatar" :alt="task.steam_name" />
            <div class="task-result-main">
              <div class="task-title-row">
                <h3>{{ task.steam_name }}</h3>
                <span>#{{ task.id }}</span>
              </div>
              <p>{{ task.steam_id }}</p>
            </div>
            <div class="task-stat task-stat--amount">
              <span>库存数量</span>
              <strong>{{ task.amount }}件</strong>
            </div>
            <div class="task-stat task-stat--value">
              <span>库存总价值</span>
              <strong>{{ formatTaskValue(task.sum_value) }}</strong>
            </div>
            <div class="task-stat">
              <span>订阅数</span>
              <strong>{{ task.subs }}人</strong>
            </div>
            <div class="task-stat task-stat--wide">
              <span>最近可交易变动</span>
              <strong>{{ formatTaskTime(task.traded_at) }}</strong>
            </div>
            <span class="task-state">
              库存公开
            </span>
          </button>
        </div>
      </div>

    </section>

    <section v-if="selectedMonitorTask" class="dashboard-grid">
      <section class="inventory-panel panel-card">
        <div class="task-business-head inventory-business-head">
          <div>
            <span class="eyebrow">Inventory Activity</span>
            <h3>{{ selectedMonitorTask.steam_name }} 的{{ activeTab === "all" ? "全部库存" : "库存动态" }}</h3>
            <p>任务 ID #{{ selectedMonitorTask.id }}，{{ activeTab === "all" ? "点击全部库存后调用 get_task_all 接口展示。" : "点击搜索结果后按接口返回展示。" }}</p>
          </div>
          <strong>{{ activeTab === "all" ? inventoryStats.total : taskBusinessTotal }} 条记录</strong>
        </div>

        <div v-if="activeTab === 'dynamic' && taskBusinessError" class="task-search-message task-search-message--error">
          {{ taskBusinessError }}
        </div>
        <div v-else-if="activeTab === 'dynamic' && taskBusinessLoading" class="task-search-message">正在获取该用户库存动态...</div>
        <div v-else-if="activeTab === 'dynamic' && !taskBusinessItems.length" class="task-search-message">该任务暂无库存动态。</div>
        <div v-else-if="activeTab === 'all' && taskAllError" class="task-search-message task-search-message--error">
          {{ taskAllError }}
        </div>
        <div v-else-if="activeTab === 'all' && taskAllLoading" class="task-search-message">正在获取该用户全部库存...</div>
        <div v-else-if="activeTab === 'all' && !taskAllItems.length" class="task-search-message">该任务暂无全部库存数据。</div>

        <div class="panel-tabs">
          <div class="tab-buttons">
            <button :class="{ active: activeTab === 'dynamic' }" @click="handleActiveTabChange('dynamic')">
              库存动态
            </button>
            <button :class="{ active: activeTab === 'all' }" @click="handleActiveTabChange('all')">
              全部库存 <span>{{ taskAllTotal || inventoryStats.visibleCount }}</span>
            </button>
          </div>
          <button v-if="activeTab === 'all'" class="sort-button">
            默认排序 <span>✓</span>
          </button>
        </div>

        <div class="filter-bar" :class="{ 'filter-bar--cards': activeTab === 'all' }">
          <button class="type-select">
            {{ activeTab === "all" ? "饰品类型" : selectedType }}
            <span>⌄</span>
          </button>
          <button v-if="activeTab === 'all'" class="date-filter">
            查看指定日期库存
            <CalendarOutline class="filter-icon" />
          </button>
          <button v-if="activeTab === 'all'" class="reset-button">重置</button>
          <input v-model="searchKeyword" class="item-search" placeholder="请输入饰品关键词" />
          <button class="search-button">搜索</button>
        </div>

        <div v-if="activeTab === 'dynamic' && !taskBusinessLoading && !taskBusinessError && taskBusinessItems.length" class="inventory-dynamic-section">
          <div class="inventory-list inventory-list--paged">
            <article v-for="item in filteredItems" :key="item.id" class="inventory-row">
              <img class="item-thumb" :src="item.image" :alt="item.name" />
              <div class="item-info">
                <h3>{{ item.name }}</h3>
                <div class="item-meta">
                  <span>件数：{{ item.count }}件</span>
                  <span>状态：<b :class="item.status === 'tradable' ? 'tradable' : 'storage'">{{ item.status === "tradable" ? "可交易" : "不可交易" }} ⓘ</b></span>
                  <span>变动：{{ item.changedAt }}</span>
                </div>
              </div>
              <span class="action-pill" :class="`action-pill--${item.action}`">
                {{ item.action === "recover" ? "CD恢复" : "卖出/存入" }}
              </span>
            </article>
          </div>
          <div class="inventory-pagination">
            <span>每页最多 {{ taskBusinessPageSize }} 条，当前 {{ taskBusinessPageRange }} / {{ taskBusinessTotal }} 条</span>
            <div class="pagination-actions">
              <button
                type="button"
                :disabled="taskBusinessPageIndex <= 1 || taskBusinessLoading"
                @click="changeTaskBusinessPage('prev')"
              >
                上一页
              </button>
              <strong>{{ taskBusinessPageIndex }} / {{ taskBusinessPageTotal }}</strong>
              <button
                type="button"
                :disabled="taskBusinessPageIndex >= taskBusinessPageTotal || taskBusinessLoading"
                @click="changeTaskBusinessPage('next')"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'all' && !taskAllLoading && !taskAllError && taskAllItems.length" class="inventory-cards-section">
          <div class="inventory-summary">
            共{{ inventoryStats.visibleCount }}件
            <span>价值:{{ inventoryStats.value }}</span>
          </div>
          <div class="inventory-card-grid">
            <article
              v-for="item in pagedTaskAllItems"
              :key="item.id"
              class="inventory-card"
            >
              <div class="card-image-wrap">
                <span class="wear-ribbon" :class="`wear-ribbon--${item.rarityTone}`">{{ item.wear }}</span>
                <img :src="item.image" :alt="item.name" />
              </div>
              <h3>{{ item.name }}</h3>
              <div class="card-bottom">
                <strong>￥{{ formatPrice(item.price) }}</strong>
                <span>{{ item.count }}件</span>
              </div>
            </article>
          </div>
          <div class="inventory-pagination inventory-pagination--cards">
            <span>每页 {{ taskAllPageSize }} 个，当前 {{ taskAllPageRange }} / {{ filteredItems.length }} 个</span>
            <div class="pagination-actions">
              <button
                type="button"
                :disabled="taskAllPageIndex <= 1"
                @click="changeTaskAllPage('prev')"
              >
                上一页
              </button>
              <strong>{{ taskAllPageIndex }} / {{ taskAllPageTotal }}</strong>
              <button
                type="button"
                :disabled="taskAllPageIndex >= taskAllPageTotal"
                @click="changeTaskAllPage('next')"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside class="side-column">
        <section class="panel-card operation-card">
          <h2>监控操作</h2>
          <div class="operation-actions">
            <button>
              <PauseOutline class="side-icon" />
              暂停
            </button>
            <button>
              <TrashOutline class="side-icon" />
              删除
            </button>
          </div>
        </section>

        <section class="panel-card stats-card">
          <h2>基本信息</h2>
          <div class="stats-grid">
            <div>
              <span>库存变动</span>
              <strong>{{ monitorTaskStats.changed }}</strong>
            </div>
            <div>
              <span>库存总价值</span>
              <strong>{{ monitorTaskStats.value }}</strong>
            </div>
            <div>
              <span>库存总数量 ⓘ</span>
              <strong>{{ monitorTaskStats.totalCount }}件</strong>
            </div>
            <div>
              <span>可查看数量 ⓘ</span>
              <strong>{{ monitorTaskStats.visibleCount }}件</strong>
            </div>
            <div>
              <span>订阅数</span>
              <strong>{{ monitorTaskStats.subscribers }}人</strong>
            </div>
            <div>
              <span>监控状态</span>
              <strong class="running-dot">运行中</strong>
            </div>
          </div>
        </section>

        <section v-if="categoryShares.length" class="panel-card share-card">
          <h2>板块分布</h2>
          <div class="share-head">
            <span></span>
            <span>价值占比</span>
            <span>数量占比</span>
          </div>
          <div v-for="category in categoryShares" :key="category.name" class="share-row">
            <span>{{ category.name }}</span>
            <div class="share-metric">
              <div class="bar-track">
                <i :style="{ width: `${category.valueRate}%` }"></i>
              </div>
              <span>{{ category.valueRate.toFixed(2) }}%</span>
            </div>
            <div class="share-metric">
              <div class="bar-track bar-track--count">
                <i :style="{ width: `${category.countRate}%` }"></i>
              </div>
              <span>{{ category.countRate.toFixed(2) }}%</span>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.inventory-monitor-page {
  min-height: 100vh;
  padding: 0 6px 28px;
  background:
    radial-gradient(circle at 18% -10%, rgba(42, 112, 255, 0.16), transparent 34%),
    radial-gradient(circle at 92% 20%, rgba(87, 201, 139, 0.1), transparent 28%),
    #191b1b;
  color: #c8cdd0;
  font-family:
    "Lato",
    "Microsoft YaHei",
    sans-serif;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(7, max-content) minmax(300px, 1fr);
  gap: 8px;
  align-items: center;
  height: 52px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(23, 25, 25, 0.96);
  backdrop-filter: blur(16px);
}

.nav-item {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  height: 34px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: #a9b0b3;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.nav-item--active,
.nav-item:hover {
  color: #e7ecef;
}

.nav-icon,
.search-icon,
.side-icon {
  width: 16px;
  height: 16px;
  color: currentColor;
}

.global-search {
  justify-self: end;
  display: flex;
  align-items: center;
  width: min(380px, 100%);
  height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.02);
}

.global-search input,
.item-search {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #d7dde0;
}

.global-search input::placeholder,
.item-search::placeholder {
  color: #81878a;
}

.panel-card {
  border: 1px solid rgba(255, 255, 255, 0.035);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(37, 39, 39, 0.96), rgba(31, 34, 33, 0.96));
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.18);
}

.task-search-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(360px, 1.1fr);
  gap: 24px;
  align-items: center;
  padding: 24px 32px;
  margin: 8px 0;
  overflow: hidden;
}

.task-search-card::before {
  position: absolute;
  top: -110px;
  right: 10%;
  width: 260px;
  height: 260px;
  content: "";
  background: radial-gradient(circle, rgba(47, 117, 210, 0.24), transparent 64%);
  pointer-events: none;
}

.task-search-copy,
.task-search-form,
.task-result-panel {
  position: relative;
  z-index: 1;
}

.eyebrow {
  color: #58a9ee;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.task-search-copy h2 {
  margin: 8px 0 8px;
  color: #e3e8ea;
  font-size: 24px;
}

.task-search-copy p {
  max-width: 640px;
  margin: 0;
  color: #9fa6a8;
  font-size: 14px;
  line-height: 1.8;
}

.task-search-copy strong {
  color: #87c5ff;
}

.task-search-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 116px;
  gap: 12px;
}

.task-search-input {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(88, 169, 238, 0.2);
  border-radius: 8px;
  background: rgba(18, 20, 20, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.task-search-input input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e1e7ea;
}

.task-search-input input::placeholder {
  color: #757d80;
}

.task-search-button {
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2f75d2, #58a9ee);
  color: white;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(47, 117, 210, 0.28);
}

.task-search-button:disabled {
  cursor: not-allowed;
  filter: grayscale(0.25);
  opacity: 0.68;
}

.task-result-panel,
.task-search-message {
  grid-column: 1 / -1;
}

.task-search-message {
  position: relative;
  z-index: 1;
  padding: 14px 16px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #aeb5b8;
  background: rgba(18, 20, 20, 0.46);
}

.task-search-message--error {
  border-color: rgba(240, 104, 85, 0.28);
  color: #ff9f92;
}

.task-result-panel {
  display: grid;
  gap: 12px;
}

.task-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #9fa6a8;
  font-size: 14px;
}

.task-result-head strong {
  color: #58a9ee;
}

.task-result-list {
  display: grid;
  gap: 8px;
}

.task-result-item {
  display: grid;
  grid-template-columns: 54px minmax(180px, 1fr) 96px 128px 74px 170px 78px;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.045);
  border-radius: 10px;
  background:
    linear-gradient(90deg, rgba(47, 117, 210, 0.12), transparent 18%),
    rgba(19, 22, 22, 0.62);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;
}

.task-result-item:hover,
.task-result-item--active {
  border-color: rgba(88, 169, 238, 0.26);
  background:
    linear-gradient(90deg, rgba(47, 117, 210, 0.18), transparent 24%),
    rgba(24, 28, 28, 0.78);
  transform: translateY(-2px);
}

.task-result-item--active {
  box-shadow: inset 3px 0 0 #58a9ee;
}

.task-avatar {
  width: 54px;
  height: 54px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  object-fit: cover;
  background: #303435;
}

.task-title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.task-result-main h3 {
  margin: 0;
  overflow: hidden;
  color: #dfe5e8;
  font-size: 16px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-title-row span {
  flex: 0 0 auto;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(88, 169, 238, 0.12);
  color: #87c5ff;
  font-size: 12px;
  font-weight: 900;
}

.task-result-main p,
.task-stat span {
  margin: 6px 0 0;
  color: #8d9598;
  font-size: 12px;
}

.task-result-main p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-stat strong {
  display: block;
  margin-top: 5px;
  color: #ccd3d6;
  font-size: 14px;
  font-weight: 900;
}

.task-stat--amount strong {
  color: #8dda43;
}

.task-stat--value strong {
  color: #e59b42;
}

.task-state {
  justify-self: end;
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(102, 143, 54, 0.22);
  color: #d9f6b5;
  font-size: 12px;
  font-weight: 900;
}

.task-state--paused {
  background: rgba(240, 104, 85, 0.14);
  color: #f06855;
}

.task-business-panel {
  position: relative;
  z-index: 1;
  grid-column: 1 / -1;
  display: grid;
  gap: 14px;
  padding-top: 4px;
}

.task-business-head {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.task-business-head h3 {
  margin: 7px 0 6px;
  color: #e1e7ea;
  font-size: 20px;
}

.task-business-head p {
  margin: 0;
  color: #8d9598;
  font-size: 13px;
}

.task-business-head strong {
  flex: 0 0 auto;
  color: #58a9ee;
  font-size: 14px;
}

.task-business-list {
  display: grid;
  gap: 8px;
}

.task-business-item {
  display: grid;
  grid-template-columns: 64px minmax(180px, 1fr) 92px 170px;
  gap: 14px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.045);
  border-radius: 10px;
  background: rgba(14, 17, 17, 0.56);
}

.business-thumb {
  width: 64px;
  height: 44px;
  border-radius: 7px;
  object-fit: contain;
  background:
    radial-gradient(circle at 50% 20%, rgba(100, 113, 118, 0.32), transparent 58%),
    #2d3030;
}

.business-main h4 {
  margin: 0 0 6px;
  overflow: hidden;
  color: #dfe5e8;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.business-main p,
.task-business-item time {
  margin: 0;
  color: #8d9598;
  font-size: 12px;
}

.business-type {
  justify-self: start;
  padding: 5px 8px;
  border-radius: 5px;
  background: rgba(85, 124, 31, 0.34);
  color: #8dda43;
  font-size: 12px;
  font-weight: 900;
}

.business-type--sell {
  background: rgba(111, 44, 34, 0.4);
  color: #f06855;
}

.operation-actions,
.item-meta {
  display: flex;
  align-items: center;
}

.inventory-row h3 {
  color: #5ba9f1;
}

.operation-actions button,
.search-button,
.type-select {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 34px;
  border-radius: 6px;
  font-weight: 800;
  cursor: pointer;
}

.operation-actions button,
.type-select {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: #c2c8ca;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(640px, 1fr) 360px;
  gap: 10px;
}

.inventory-panel {
  padding: 28px 32px;
}

.panel-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.tab-buttons {
  display: flex;
  gap: 30px;
  align-items: center;
}

.panel-tabs button {
  border: 0;
  background: transparent;
  color: #c1c8ca;
  font-weight: 800;
  cursor: pointer;
}

.panel-tabs button.active {
  color: #58a9ee;
}

.sort-button {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #8fb7db !important;
  font-size: 13px;
}

.sort-button span {
  padding: 0;
  margin-left: 0;
  background: transparent;
  color: #57a9ee;
}

.panel-tabs span {
  padding: 2px 7px;
  margin-left: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #90979a;
  font-size: 12px;
}

.filter-bar {
  display: grid;
  grid-template-columns: 112px 1fr 66px;
  gap: 14px;
  margin-bottom: 20px;
}

.filter-bar--cards {
  grid-template-columns: 116px 180px 64px minmax(180px, 1fr) 66px;
  gap: 10px;
  align-items: center;
}

.type-select,
.date-filter,
.reset-button,
.item-search {
  height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  background: rgba(18, 20, 20, 0.7);
  color: #d0d7d9;
}

.date-filter,
.reset-button {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.filter-icon {
  width: 15px;
  height: 15px;
  color: #7f878b;
}

.search-button {
  border: 0;
  background: #2f75d2;
  color: white;
}

.inventory-list {
  display: grid;
}

.inventory-dynamic-section {
  display: grid;
  gap: 14px;
}

.inventory-list--paged {
  max-height: 760px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-color: rgba(88, 169, 238, 0.42) rgba(255, 255, 255, 0.04);
  scrollbar-width: thin;
}

.inventory-list--paged::-webkit-scrollbar {
  width: 8px;
}

.inventory-list--paged::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
}

.inventory-list--paged::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(88, 169, 238, 0.42);
}

.inventory-pagination {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.045);
  border-radius: 8px;
  background: rgba(18, 20, 20, 0.44);
  color: #8d9598;
  font-size: 13px;
}

.pagination-actions {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.pagination-actions strong {
  min-width: 56px;
  color: #d2d8da;
  font-size: 13px;
  text-align: center;
}

.pagination-actions button {
  height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(88, 169, 238, 0.26);
  border-radius: 6px;
  background: rgba(47, 117, 210, 0.14);
  color: #87c5ff;
  font-weight: 900;
  cursor: pointer;
}

.pagination-actions button:disabled {
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  color: #6f777a;
}

.inventory-pagination--cards {
  margin-top: 18px;
}

.inventory-row {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr) 88px;
  gap: 16px;
  align-items: center;
  min-height: 72px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.035);
}

.item-thumb {
  width: 72px;
  height: 46px;
  border-radius: 5px;
  object-fit: cover;
  background: #3b3f40;
}

.inventory-row h3 {
  margin: 0 0 10px;
  overflow: hidden;
  font-size: 15px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  gap: 32px;
  color: #aab0b1;
  font-size: 13px;
}

.tradable {
  padding: 2px 7px;
  border-radius: 3px;
  background: rgba(102, 143, 54, 0.36);
  color: #8dda43;
}

.storage {
  padding: 2px 7px;
  border-radius: 3px;
  background: rgba(111, 44, 34, 0.46);
  color: #f06855;
}

.action-pill {
  justify-self: end;
  padding: 4px 9px;
  border-radius: 3px;
  font-size: 13px;
  font-weight: 900;
}

.action-pill--recover {
  background: rgba(85, 124, 31, 0.42);
  color: #80c83a;
}

.action-pill--sell {
  background: rgba(111, 44, 34, 0.46);
  color: #f06855;
}

.inventory-cards-section {
  padding-top: 4px;
}

.inventory-summary {
  margin: 10px 0 20px;
  color: #aeb5b8;
  font-size: 15px;
  font-weight: 800;
  text-align: center;
}

.inventory-summary span {
  margin-left: 14px;
  color: #d6dbdd;
}

.inventory-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.inventory-card {
  position: relative;
  overflow: hidden;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.035);
  border-radius: 4px;
  background: linear-gradient(180deg, #2d3030 0%, #252828 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.inventory-card:hover {
  border-color: rgba(88, 169, 238, 0.28);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  transform: translateY(-3px);
}

.card-image-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 132px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 18%, rgba(100, 113, 118, 0.42), transparent 52%),
    linear-gradient(180deg, #3a3e3f 0%, #303435 54%, #292c2d 100%);
}

.card-image-wrap::after {
  position: absolute;
  inset: auto 18px 10px;
  height: 12px;
  content: "";
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.36), transparent 68%);
  filter: blur(4px);
}

.card-image-wrap img {
  position: relative;
  z-index: 1;
  width: 82%;
  height: 92px;
  object-fit: contain;
  filter: drop-shadow(0 12px 14px rgba(0, 0, 0, 0.42));
}

.wear-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  min-width: 74px;
  padding: 6px 10px;
  border-radius: 0 0 4px;
  color: #f4f7f8;
  font-size: 12px;
  font-weight: 900;
  text-align: center;
}

.wear-ribbon--blue {
  background: #316faa;
}

.wear-ribbon--green {
  background: #608e35;
}

.wear-ribbon--orange {
  background: #9b6b21;
}

.wear-ribbon--purple {
  background: #7445a7;
}

.wear-ribbon--gray {
  background: #62686a;
}

.inventory-card h3 {
  min-height: 42px;
  margin: 12px 12px 10px;
  overflow: hidden;
  color: #d3d9dc;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 13px;
}

.card-bottom strong {
  color: #e59b42;
  font-size: 16px;
  font-weight: 900;
}

.card-bottom span {
  color: #9aa1a4;
  font-size: 13px;
  font-weight: 800;
}

.side-column {
  display: grid;
  gap: 10px;
  align-content: start;
}

.operation-card,
.stats-card,
.share-card {
  padding: 22px;
}

.operation-card h2,
.stats-card h2,
.share-card h2 {
  position: relative;
  margin: 0 0 28px;
  padding-left: 14px;
  color: #d8dee1;
  font-size: 16px;
}

.operation-card h2::before,
.stats-card h2::before,
.share-card h2::before {
  position: absolute;
  top: 1px;
  left: 0;
  width: 4px;
  height: 18px;
  content: "";
  border-radius: 99px;
  background: #2f75d2;
}

.operation-actions {
  justify-content: center;
  gap: 24px;
  height: 50px;
}

.operation-actions button {
  min-width: 78px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px 26px;
  text-align: center;
}

.stats-grid span,
.share-head,
.share-row {
  color: #9fa6a8;
  font-size: 14px;
}

.stats-grid strong {
  display: block;
  margin-top: 7px;
  color: #d2d8da;
  font-size: 18px;
}

.running-dot {
  color: #62dc73 !important;
}

.running-dot::before {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 4px;
  content: "";
  border: 3px solid #62dc73;
  border-top-color: transparent;
  border-radius: 999px;
  vertical-align: -1px;
  animation: spin 1.2s linear infinite;
}

.share-head,
.share-row {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.share-head {
  margin-bottom: 14px;
  text-align: center;
}

.share-row {
  min-height: 28px;
}

.share-row > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-metric {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 62px;
  gap: 8px;
  align-items: center;
}

.share-metric span {
  color: #c7cdd0;
  font-size: 12px;
  font-weight: 900;
  text-align: right;
}

.bar-track {
  height: 18px;
  overflow: hidden;
  border-radius: 4px;
  background: rgba(54, 64, 67, 0.74);
}

.bar-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2d6da3, rgba(91, 169, 241, 0.2));
}

.bar-track--count i {
  background: linear-gradient(90deg, #5f8d34, rgba(141, 218, 67, 0.2));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1080px) {
  .top-nav,
  .task-search-card,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .task-result-item {
    grid-template-columns: 54px minmax(180px, 1fr) repeat(3, minmax(92px, auto));
  }

  .task-business-item {
    grid-template-columns: 64px minmax(180px, 1fr) 92px;
  }

  .task-business-item time {
    grid-column: 2 / -1;
  }

  .task-state {
    justify-self: start;
  }

  .filter-bar--cards {
    grid-template-columns: 116px 180px 64px minmax(180px, 1fr) 66px;
  }

  .inventory-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .global-search {
    justify-self: stretch;
    width: auto;
  }

}

@media (max-width: 720px) {
  .inventory-monitor-page {
    padding: 0 0 20px;
  }

  .inventory-panel,
  .task-search-card,
  .operation-card,
  .stats-card,
  .share-card {
    padding: 18px;
  }

  .task-search-form,
  .task-result-item,
  .task-business-item,
  .filter-bar,
  .inventory-row,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .task-business-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .task-business-item time {
    grid-column: auto;
  }

  .business-main h4 {
    white-space: normal;
  }

  .task-result-main h3 {
    white-space: normal;
  }

  .task-result-main p {
    white-space: normal;
  }

  .panel-tabs {
    align-items: flex-start;
    flex-direction: column;
  }

  .inventory-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .item-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .action-pill {
    justify-self: start;
  }
}

@media (max-width: 460px) {
  .inventory-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
