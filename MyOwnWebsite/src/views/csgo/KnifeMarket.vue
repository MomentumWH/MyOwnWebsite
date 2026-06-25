<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { useRouter } from "vue-router";
import {
  BarChartOutline,
  CalendarOutline,
  CartOutline,
  HomeOutline,
  ListOutline,
  SearchOutline,
  SwapHorizontalOutline,
  TrophyOutline,
} from "@vicons/ionicons5";

interface NavItem {
  label: string;
  key: string;
  icon: unknown;
  path: string;
}

interface KnifeMarketItem {
  id: number;
  name: string;
  image: string;
  platform: string;
  sellPrice: number;
  buyPrice: number;
  diff: number;
  diffRate: number;
  volume: number;
  trend: "up" | "down" | "flat";
  updatedAt: string;
}

const router = useRouter();
const activeNav = shallowRef("knife");
const searchKeyword = shallowRef("");

const navItems: NavItem[] = [
  { label: "首页", key: "home", icon: HomeOutline, path: "/cs-items" },
  { label: "饰品列表", key: "items", icon: ListOutline, path: "/item-list" },
  { label: "排行榜单", key: "ranking", icon: TrophyOutline, path: "/item-ranking" },
  { label: "库存监控", key: "inventory", icon: CartOutline, path: "/inventory-monitor" },
  { label: "挂刀行情", key: "knife", icon: CalendarOutline, path: "/knife-market" },
  { label: "热门系列", key: "series", icon: BarChartOutline, path: "/cs-items?section=series" },
];

const summaryCards = [
  { label: "今日挂刀单", value: "1,284", note: "较昨日 +8.4%" },
  { label: "Steam 余额", value: "¥ 128,420", note: "可出金资金" },
  { label: "平台余额", value: "¥ 94,680", note: "当前在售库存" },
  { label: "均摊利润率", value: "12.6%", note: "按近 7 日成交" },
];

const filterChips = ["全部平台", "BUFF", "悠悠有品", "C5GAME", "IGXE"];
const activeFilter = shallowRef("全部平台");

const marketItems = shallowRef<KnifeMarketItem[]>([
  {
    id: 1,
    name: "爪子刀 | 渐变之色 (崭新出厂)",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20karambit%20fade%20knife&image_size=square",
    platform: "BUFF",
    sellPrice: 15320,
    buyPrice: 14780,
    diff: 540,
    diffRate: 3.66,
    volume: 22,
    trend: "up",
    updatedAt: "2 分钟前",
  },
  {
    id: 2,
    name: "蝴蝶刀 | 虎牙 (略有磨损)",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20butterfly%20knife%20damascus%20steel&image_size=square",
    platform: "悠悠有品",
    sellPrice: 9880,
    buyPrice: 9550,
    diff: 330,
    diffRate: 3.46,
    volume: 18,
    trend: "up",
    updatedAt: "5 分钟前",
  },
  {
    id: 3,
    name: "M9 刺刀 | 传说 (久经沙场)",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20m9%20bayonet%20lore%20knife&image_size=square",
    platform: "BUFF",
    sellPrice: 7260,
    buyPrice: 7385,
    diff: -125,
    diffRate: -1.69,
    volume: 14,
    trend: "down",
    updatedAt: "8 分钟前",
  },
  {
    id: 4,
    name: "匕首 | 多普勒 (崭新出厂)",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20dagger%20doppler%20knife&image_size=square",
    platform: "C5GAME",
    sellPrice: 5480,
    buyPrice: 5400,
    diff: 80,
    diffRate: 1.48,
    volume: 31,
    trend: "up",
    updatedAt: "12 分钟前",
  },
  {
    id: 5,
    name: "弯刀 | 自动化工业 (久经沙场)",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20falchion%20knife%20case%20hardened&image_size=square",
    platform: "IGXE",
    sellPrice: 2130,
    buyPrice: 2195,
    diff: -65,
    diffRate: -2.96,
    volume: 44,
    trend: "down",
    updatedAt: "17 分钟前",
  },
  {
    id: 6,
    name: "熊刀 | 黑层压板 (略有磨损)",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20ursus%20knife%20black%20laminate&image_size=square",
    platform: "BUFF",
    sellPrice: 4680,
    buyPrice: 4680,
    diff: 0,
    diffRate: 0,
    volume: 25,
    trend: "flat",
    updatedAt: "刚刚",
  },
]);

const filteredItems = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  return marketItems.value.filter((item) => {
    const matchesKeyword = !keyword || item.name.toLowerCase().includes(keyword);
    const matchesFilter = activeFilter.value === "全部平台" || item.platform === activeFilter.value;
    return matchesKeyword && matchesFilter;
  });
});

const handleNavClick = (item: NavItem) => {
  activeNav.value = item.key;
  router.push(item.path);
};

const formatMoney = (value: number) => `¥ ${value.toLocaleString()}`;
</script>

<template>
  <main class="knife-market-page">
    <nav class="top-nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ 'nav-item--active': activeNav === item.key }"
        type="button"
        @click="handleNavClick(item)"
      >
        <component :is="item.icon" class="nav-icon" />
        <span>{{ item.label }}</span>
      </button>
      <div class="nav-spacer"></div>
    </nav>

    <section class="hero-card panel-card">
      <div>
        <span class="eyebrow">Knife Market</span>
        <h1>挂刀行情</h1>
        <p>聚合 Steam 市场与主流交易平台价格，关注价差、成交量和走势，快速判断挂刀机会。</p>
      </div>
      <div class="hero-metrics">
        <div v-for="card in summaryCards" :key="card.label" class="metric-card">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <em>{{ card.note }}</em>
        </div>
      </div>
    </section>

    <section class="control-card panel-card">
      <div class="search-box">
        <SearchOutline class="search-icon" />
        <input v-model="searchKeyword" placeholder="搜索刀型、皮肤名或平台" />
      </div>
      <div class="filter-group">
        <button
          v-for="chip in filterChips"
          :key="chip"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeFilter === chip }"
          type="button"
          @click="activeFilter = chip"
        >
          {{ chip }}
        </button>
      </div>
    </section>

    <section class="layout-grid">
      <section class="panel-card ranking-panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Top Spread</span>
            <h2>优先挂刀清单</h2>
          </div>
          <strong>{{ filteredItems.length }} 条可用行情</strong>
        </div>

        <div class="market-table">
          <div class="table-head">
            <span>饰品</span>
            <span>平台</span>
            <span>挂刀价</span>
            <span>回收价</span>
            <span>价差</span>
            <span>成交量</span>
            <span>更新</span>
          </div>
          <article v-for="item in filteredItems" :key="item.id" class="table-row">
            <div class="market-name">
              <img :src="item.image" :alt="item.name" />
              <div>
                <h3>{{ item.name }}</h3>
                <span>{{ item.trend === 'up' ? '上升趋势' : item.trend === 'down' ? '回落趋势' : '横盘整理' }}</span>
              </div>
            </div>
            <span class="platform-pill">{{ item.platform }}</span>
            <span class="money">{{ formatMoney(item.sellPrice) }}</span>
            <span class="money money--soft">{{ formatMoney(item.buyPrice) }}</span>
            <span :class="['diff', item.diff >= 0 ? 'diff--up' : 'diff--down']">
              {{ item.diff >= 0 ? '+' : '' }}{{ formatMoney(Math.abs(item.diff)) }}
              <em>{{ item.diffRate >= 0 ? '+' : '' }}{{ item.diffRate.toFixed(2) }}%</em>
            </span>
            <span>{{ item.volume }} 笔</span>
            <span>{{ item.updatedAt }}</span>
          </article>
        </div>
      </section>

      <aside class="side-column">
        <section class="panel-card side-card">
          <h2>策略提示</h2>
          <ul>
            <li>优先关注价差稳定、成交量足够的刀型。</li>
            <li>高波动品类建议只做短线，减少隔夜风险。</li>
            <li>平台价差可先看买入，再看卖出深度。</li>
          </ul>
        </section>

        <section class="panel-card side-card">
          <h2>市场节奏</h2>
          <div class="pulse-list">
            <div>
              <span>BUFF</span>
              <strong>活跃</strong>
            </div>
            <div>
              <span>悠悠有品</span>
              <strong>平稳</strong>
            </div>
            <div>
              <span>C5GAME</span>
              <strong>补货中</strong>
            </div>
            <div>
              <span>IGXE</span>
              <strong>偏弱</strong>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.knife-market-page {
  min-height: 100vh;
  padding: 0 6px 28px;
  background:
    radial-gradient(circle at 12% 0%, rgba(88, 169, 238, 0.18), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(110, 78, 34, 0.18), transparent 26%),
    linear-gradient(180deg, #1a1c1d 0%, #151717 100%);
  color: #c8cdd0;
  font-family: "Lato", "Microsoft YaHei", sans-serif;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;
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
.search-icon {
  width: 16px;
  height: 16px;
}

.nav-spacer {
  flex: 1;
}

.panel-card {
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(37, 39, 39, 0.96), rgba(31, 34, 33, 0.96));
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.18);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(420px, 1.2fr);
  gap: 20px;
  align-items: center;
  padding: 26px 30px;
  margin: 10px 0;
}

.eyebrow {
  color: #58a9ee;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-card h1,
.panel-head h2,
.side-card h2 {
  margin: 8px 0 10px;
  color: #e3e8ea;
}

.hero-card p {
  margin: 0;
  color: #9fa6a8;
  line-height: 1.8;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 14px;
  border-radius: 10px;
  background: rgba(18, 20, 20, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.metric-card span,
.metric-card em {
  display: block;
  color: #9fa6a8;
  font-size: 12px;
  font-style: normal;
}

.metric-card strong {
  display: block;
  margin: 8px 0 6px;
  color: #f0f3f5;
  font-size: 20px;
}

.control-card {
  display: grid;
  gap: 16px;
  padding: 18px 22px;
  margin-bottom: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(88, 169, 238, 0.2);
  border-radius: 8px;
  background: rgba(18, 20, 20, 0.72);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e1e7ea;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  color: #c2c8ca;
  cursor: pointer;
}

.filter-chip--active {
  border-color: rgba(88, 169, 238, 0.3);
  background: rgba(88, 169, 238, 0.14);
  color: #87c5ff;
}

.layout-grid {
  display: grid;
  grid-template-columns: minmax(640px, 1fr) 320px;
  gap: 12px;
}

.ranking-panel {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-head strong {
  color: #58a9ee;
}

.market-table {
  display: grid;
  gap: 8px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) 88px 96px 96px 130px 76px 84px;
  gap: 12px;
  align-items: center;
}

.table-head {
  padding: 12px 14px;
  color: #8d9598;
  font-size: 12px;
  background: rgba(18, 20, 20, 0.5);
  border-radius: 8px;
}

.table-row {
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(18, 20, 20, 0.46);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.market-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.market-name img {
  width: 56px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  background: #2d3030;
}

.market-name h3 {
  margin: 0 0 4px;
  color: #dfe5e8;
  font-size: 14px;
}

.market-name span,
.table-row span {
  color: #8d9598;
  font-size: 12px;
}

.platform-pill {
  width: fit-content;
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(88, 169, 238, 0.12);
  color: #87c5ff !important;
  font-weight: 800;
}

.money {
  color: #f0f3f5 !important;
  font-weight: 800;
}

.money--soft {
  color: #c3c9cb !important;
}

.diff {
  display: grid;
  gap: 4px;
  font-weight: 800;
}

.diff em {
  font-style: normal;
  font-size: 12px;
}

.diff--up,
.diff--up em {
  color: #7fc24d;
}

.diff--down,
.diff--down em {
  color: #f06855;
}

.side-column {
  display: grid;
  gap: 12px;
  align-content: start;
}

.side-card {
  padding: 20px;
}

.side-card ul,
.pulse-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.side-card li,
.pulse-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #aeb5b8;
}

.pulse-list strong {
  color: #d2d8da;
}

@media (max-width: 1080px) {
  .hero-card,
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-head,
  .table-row {
    grid-template-columns: minmax(220px, 1.4fr) 88px 96px 96px 130px 76px 84px;
  }
}

@media (max-width: 720px) {
  .knife-market-page {
    padding: 0 0 20px;
  }

  .hero-card,
  .ranking-panel,
  .side-card,
  .control-card {
    padding: 18px;
  }

  .hero-metrics {
    grid-template-columns: 1fr;
  }

  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
