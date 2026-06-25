<script setup lang="ts">
import { computed, onMounted, shallowRef, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";
import {
  NButton,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NSpace,
  NSelect,
} from "naive-ui";
import {
  ArrowBackOutline,
  BarChartOutline,
  CartOutline,
  CloseOutline,
  FlameOutline,
  HomeOutline,
  ListOutline,
  SearchOutline,
  SwapHorizontalOutline,
  TrophyOutline,
  TrendingDownOutline,
  TrendingUpOutline,
} from "@vicons/ionicons5";
import CsgoLightParticles from "@/components/csgo/CsgoLightParticles.vue";
import { useCsgoPageMotion } from "@/composables/csgo/useCsgoPageMotion";

interface NavItem {
  label: string;
  key: string;
  icon: unknown;
  path: string;
}

interface RankingItem {
  id: number;
  rank: number;
  name: string;
  subtitle: string;
  image: string;
  sellPrice: number;
  buyPrice: number;
  changePercent: number;
  marketCap: string;
  volume: number;
  sparkline: number[];
  tag: string;
  tagType: "gold" | "red" | "blue" | "green" | "purple";
}

const router = useRouter();
const pageRef = useTemplateRef<HTMLElement>("pageRef");
const { clearMotions, playStaggerIn, playTimeline, pulse } = useCsgoPageMotion(pageRef);

const navItems: NavItem[] = [
  { label: "首页", key: "home", icon: HomeOutline, path: "/cs-items" },
  { label: "饰品列表", key: "items", icon: ListOutline, path: "/item-list" },
  { label: "饰品数据", key: "cs-items", icon: BarChartOutline, path: "/cs-items" },
  { label: "排行榜", key: "ranking", icon: TrophyOutline, path: "/item-ranking" },
  { label: "库存监控", key: "inventory", icon: CartOutline, path: "/inventory-monitor" },
  { label: "挂刀行情", key: "knife", icon: SwapHorizontalOutline, path: "/knife-market" },
  { label: "热门系列", key: "series", icon: FlameOutline, path: "/cs-items?section=series" },
];

const rankingTabs = ["价格榜", "数量榜", "租赁榜", "热门榜", "平台差价榜", "存世量榜", "成交榜", "挂刀套现"];
const metricChips = ["涨幅榜(百分比)", "跌幅榜(百分比)", "涨幅榜", "跌幅榜", "在售价", "求购价", "饰品总市值"];
const timeOptions = [
  { label: "近1天", value: "1d" },
  { label: "近7天", value: "7d" },
  { label: "近30天", value: "30d" },
  { label: "近90天", value: "90d" },
];

const rankingItems: RankingItem[] = [
  {
    id: 1,
    rank: 1,
    name: "AK-47 | 皇后 (崭新出厂)",
    subtitle: "近24小时成交 218 件 · 隐秘品质",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20AK47%20empress%20skin%20factory%20new&image_size=square",
    sellPrice: 7657.5,
    buyPrice: 7420,
    changePercent: 18.42,
    marketCap: "¥ 1.82亿",
    volume: 218,
    sparkline: [42, 45, 44, 51, 57, 55, 63, 69, 76, 82, 91, 96],
    tag: "涨幅领跑",
    tagType: "gold",
  },
  {
    id: 2,
    rank: 2,
    name: "运动手套 (★) | 树篱迷宫 (久经沙场)",
    subtitle: "近24小时成交 72 件 · 手套热门",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20sport%20gloves%20hedge%20maze%20skin&image_size=square",
    sellPrice: 34600,
    buyPrice: 33120,
    changePercent: 12.86,
    marketCap: "¥ 3.46亿",
    volume: 72,
    sparkline: [58, 62, 64, 63, 67, 71, 74, 73, 79, 84, 88, 90],
    tag: "高价热卖",
    tagType: "red",
  },
  {
    id: 3,
    rank: 3,
    name: "M4A4 | 合纵 (崭新出厂)",
    subtitle: "近24小时成交 136 件 · 步枪精选",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20M4A4%20alliance%20skin&image_size=square",
    sellPrice: 13200,
    buyPrice: 12780,
    changePercent: 9.75,
    marketCap: "¥ 9260万",
    volume: 136,
    sparkline: [48, 46, 52, 55, 57, 60, 58, 64, 67, 71, 73, 78],
    tag: "稳定上涨",
    tagType: "blue",
  },
  {
    id: 4,
    rank: 4,
    name: "印花 | G2 Esports (全息) | 2020 RMR",
    subtitle: "近24小时成交 1,111 件 · 印花活跃",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20holographic%20sticker%20G2%20esports&image_size=square",
    sellPrice: 261,
    buyPrice: 249,
    changePercent: 7.31,
    marketCap: "¥ 3580万",
    volume: 1111,
    sparkline: [36, 39, 41, 40, 44, 47, 49, 52, 51, 55, 59, 62],
    tag: "成交活跃",
    tagType: "purple",
  },
  {
    id: 5,
    rank: 5,
    name: "M4A4 | 喧嚣杀戮 (久经沙场)",
    subtitle: "近24小时成交 184 件 · 性价比区间",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20M4A4%20desolate%20space%20battle%20scarred&image_size=square",
    sellPrice: 2040,
    buyPrice: 1988,
    changePercent: 5.68,
    marketCap: "¥ 5410万",
    volume: 184,
    sparkline: [50, 53, 52, 54, 57, 56, 59, 63, 62, 66, 68, 71],
    tag: "需求提升",
    tagType: "green",
  },
  {
    id: 6,
    rank: 6,
    name: "沙漠之鹰 | 蟒蛇死神 (崭新出厂)",
    subtitle: "近24小时成交 96 件 · 手枪榜单",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20desert%20eagle%20python%20death%20skin&image_size=square",
    sellPrice: 415,
    buyPrice: 398,
    changePercent: -3.26,
    marketCap: "¥ 1190万",
    volume: 96,
    sparkline: [71, 69, 72, 68, 66, 63, 65, 62, 59, 57, 55, 52],
    tag: "短线回调",
    tagType: "red",
  },
];

const activeNavItem = shallowRef("ranking");
const searchQuery = shallowRef("");
const showSearchDropdown = shallowRef(false);
const activeRankingTab = shallowRef("价格榜");
const activeMetricChip = shallowRef("涨幅榜(百分比)");
const selectedTimeRange = shallowRef("1d");

const filteredRankingItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return rankingItems;
  }

  return rankingItems.filter((item) => item.name.toLowerCase().includes(query));
});

const topSummary = computed(() => [
  { label: "榜单饰品", value: `${filteredRankingItems.value.length}`, note: "实时筛选结果" },
  { label: "最高涨幅", value: `+${Math.max(...rankingItems.map((item) => item.changePercent)).toFixed(2)}%`, note: "近 24 小时" },
  { label: "总成交量", value: rankingItems.reduce((sum, item) => sum + item.volume, 0).toLocaleString(), note: "样本成交件数" },
]);

const formatMoney = (value: number) => `¥ ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const getSparklinePoints = (values: number[]) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 132;
      const y = 40 - ((value - min) / range) * 32;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const getRankClass = (rank: number) => {
  if (rank === 1) return "rank-badge--gold";
  if (rank === 2) return "rank-badge--silver";
  if (rank === 3) return "rank-badge--bronze";
  return "";
};

const handleNavClick = (item: NavItem) => {
  activeNavItem.value = item.key;
  router.push(item.path);
};

const goHome = () => {
  router.push("/cs-items");
};

const clearSearch = () => {
  searchQuery.value = "";
  showSearchDropdown.value = false;
};

const handleSearchBlur = () => {
  setTimeout(() => {
    showSearchDropdown.value = false;
  }, 200);
};

const goToDetail = (item: RankingItem) => {
  router.push(`/CsItemDetail?id=${item.id}`);
};

const animatePageIntro = async () => {
  clearMotions();

  await playTimeline([
    {
      targets: ".header",
      params: {
        opacity: { from: 0 },
        y: { from: -18 },
      },
    },
    {
      targets: ".ranking-hero",
      params: {
        opacity: { from: 0 },
        y: { from: 28 },
      },
      position: "-=500",
    },
    {
      targets: ".ranking-panel",
      params: {
        opacity: { from: 0 },
        y: { from: 24 },
      },
      position: "-=420",
    },
  ]);

  await playStaggerIn({
    targets: ".ranking-row",
    fromY: 18,
    fromScale: 0.98,
    delay: 55,
    duration: 420,
    ease: "outCubic",
  });
};

onMounted(() => {
  void animatePageIntro();
});

watch([activeRankingTab, activeMetricChip, selectedTimeRange], () => {
  void pulse(".ranking-tab.active, .metric-chip.active", { scale: 1.04, duration: 220 });
});
</script>

<template>
  <div ref="pageRef" class="ranking-shell">
    <CsgoLightParticles
      class="page-particles"
      :particle-count="28"
      :orb-count="5"
      intensity="medium"
    />

    <n-layout class="ranking-page" content-style="min-height: 100vh">
      <n-layout-header class="header">
        <div class="header-content">
          <div class="logo" @click="goHome">
            <span class="logo-text">CS</span>
            <span class="logo-accent">饰品</span>
          </div>

          <div class="nav-menu">
            <div
              v-for="item in navItems"
              :key="item.key"
              class="nav-item"
              :class="{ active: activeNavItem === item.key }"
              @click="handleNavClick(item)"
            >
              <component :is="item.icon" class="nav-icon" />
              <span class="nav-label">{{ item.label }}</span>
            </div>
          </div>

          <div class="header-right">
            <div class="search-container">
              <div class="search-box">
                <n-icon class="search-icon">
                  <SearchOutline />
                </n-icon>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索榜单饰品..."
                  class="search-input"
                  @focus="showSearchDropdown = true"
                  @blur="handleSearchBlur"
                />
                <n-icon v-if="searchQuery" class="clear-icon" @click="clearSearch">
                  <CloseOutline />
                </n-icon>
              </div>
            </div>
            <n-space>
              <n-button quaternary class="header-btn">登录</n-button>
              <n-button type="primary" class="header-btn register-btn">注册</n-button>
              <n-button class="back-btn" @click="goHome">
                <template #icon>
                  <n-icon><ArrowBackOutline /></n-icon>
                </template>
                返回首页
              </n-button>
            </n-space>
          </div>
        </div>
      </n-layout-header>

      <n-layout-content class="content">
        <div class="main-container">
          <section class="ranking-hero">
            <div class="hero-copy">
              <div class="eyebrow">
                <TrophyOutline class="eyebrow-icon" />
                CS 饰品市场排行榜
              </div>
              <h1>追踪饰品价格、成交与热度变化</h1>
              <p>聚合在售价、求购价、涨跌幅与近 30 天趋势，快速定位正在异动的饰品。</p>
            </div>

            <div class="summary-grid">
              <div v-for="card in topSummary" :key="card.label" class="summary-card">
                <span>{{ card.label }}</span>
                <strong>{{ card.value }}</strong>
                <small>{{ card.note }}</small>
              </div>
            </div>
          </section>

          <section class="ranking-panel">
            <div class="toolbar-card">
              <div class="toolbar-left">
                <div class="search-input-bar">
                  <n-icon class="input-search-icon">
                    <SearchOutline />
                  </n-icon>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="请输入饰品名称搜索"
                    class="main-search-input"
                  />
                </div>
                <n-button class="filter-btn">
                  <template #icon>
                    <n-icon><BarChartOutline /></n-icon>
                  </template>
                  筛选
                </n-button>
              </div>

              <div class="toolbar-right">
                <span class="select-label">价格偏好</span>
                <n-select
                  v-model:value="selectedTimeRange"
                  :options="timeOptions"
                  size="small"
                  class="time-select"
                />
              </div>
            </div>

            <div class="ranking-tabs">
              <button
                v-for="tab in rankingTabs"
                :key="tab"
                type="button"
                class="ranking-tab"
                :class="{ active: activeRankingTab === tab }"
                @click="activeRankingTab = tab"
              >
                {{ tab }}
              </button>
            </div>

            <div class="metric-row">
              <div class="metric-chips">
                <button
                  v-for="chip in metricChips"
                  :key="chip"
                  type="button"
                  class="metric-chip"
                  :class="{ active: activeMetricChip === chip }"
                  @click="activeMetricChip = chip"
                >
                  {{ chip }}
                </button>
              </div>
              <div class="updated-at">更新时间：2026-06-25 14:30</div>
            </div>

            <div class="ranking-table-card">
              <div class="table-header">
                <span>排行</span>
                <span>饰品名称</span>
                <span>在售价格</span>
                <span>求购价格</span>
                <span>上涨百分比</span>
                <span>近30天价格</span>
              </div>

              <div class="ranking-list">
                <div
                  v-for="item in filteredRankingItems"
                  :key="item.id"
                  class="ranking-row"
                  @click="goToDetail(item)"
                >
                  <div class="rank-cell">
                    <span class="rank-badge" :class="getRankClass(item.rank)">{{ item.rank }}</span>
                  </div>

                  <div class="item-cell">
                    <div class="item-image-frame">
                      <img :src="item.image" :alt="item.name" class="item-image" />
                    </div>
                    <div class="item-meta">
                      <div class="item-title">{{ item.name }}</div>
                      <div class="item-subtitle">{{ item.subtitle }}</div>
                      <div class="item-badges">
                        <span class="status-tag" :class="`status-tag--${item.tagType}`">{{ item.tag }}</span>
                        <span class="detail-link">详情</span>
                      </div>
                    </div>
                  </div>

                  <div class="price-cell strong">{{ formatMoney(item.sellPrice) }}</div>
                  <div class="price-cell">{{ formatMoney(item.buyPrice) }}</div>
                  <div class="change-cell" :class="{ down: item.changePercent < 0 }">
                    <component :is="item.changePercent >= 0 ? TrendingUpOutline : TrendingDownOutline" class="change-icon" />
                    {{ item.changePercent > 0 ? "+" : "" }}{{ item.changePercent.toFixed(2) }}%
                  </div>
                  <div class="sparkline-cell">
                    <svg viewBox="0 0 132 44" class="sparkline" aria-hidden="true">
                      <polyline :points="getSparklinePoints(item.sparkline)" />
                    </svg>
                    <span>{{ item.marketCap }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<style scoped lang="scss">
.ranking-shell {
  min-height: 100vh;
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(circle at top, rgba(54, 122, 255, 0.15), transparent 34%),
    radial-gradient(circle at 82% 14%, rgba(136, 101, 255, 0.16), transparent 26%),
    linear-gradient(180deg, #060814 0%, #0b1020 52%, #090d18 100%);
}

.page-particles {
  opacity: 0.88;
}

.ranking-page {
  min-height: 100vh;
  width: 100%;
  background: transparent;
  color: #fff;
  position: relative;
  z-index: 1;
}

.header {
  background: rgba(26, 26, 46, 0.9);
  border-bottom: 1px solid #2a2a4e;
  height: 60px;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(18px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    color: #f59e0b;
  }

  .logo-accent {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
}

.nav-menu {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 5px;
  background: transparent;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: #888;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: #667eea;

    &::after {
      content: "";
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 3px;
      background: #667eea;
      border-radius: 2px;
    }
  }
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-container {
  position: relative;
  z-index: 1000;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(42, 42, 78, 0.9);
  border: 1px solid #3a3a5e;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4a4a6e;
  }

  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
}

.search-icon {
  color: #888;
  font-size: 1.1rem;
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  width: 220px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  flex: 1;

  &::placeholder {
    color: #666;
  }
}

.clear-icon {
  color: #888;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
}

.header-btn {
  font-size: 0.9rem;
}

.register-btn,
.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.content {
  padding: 88px 24px 44px;
}

.main-container {
  max-width: 1500px;
  margin: 0 auto;
}

.ranking-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
  gap: 22px;
  margin-bottom: 22px;
}

.hero-copy,
.summary-card,
.toolbar-card,
.ranking-table-card {
  background: rgba(26, 26, 46, 0.82);
  border: 1px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.hero-copy {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 30px;

  &::after {
    position: absolute;
    inset: auto -80px -120px auto;
    width: 280px;
    height: 280px;
    content: "";
    border-radius: 999px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.22), transparent 65%);
  }

  h1 {
    max-width: 760px;
    margin: 12px 0 12px;
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  p {
    max-width: 640px;
    margin: 0;
    color: #aeb6d5;
    font-size: 1rem;
    line-height: 1.8;
  }
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  font-size: 0.9rem;
  font-weight: 800;
}

.eyebrow-icon {
  width: 18px;
  height: 18px;
}

.summary-grid {
  display: grid;
  gap: 12px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 96px;
  border-radius: 18px;
  padding: 18px;

  span,
  small {
    color: #9aa3c7;
  }

  strong {
    margin: 5px 0;
    color: #fff;
    font-size: 1.65rem;
  }
}

.ranking-panel {
  display: grid;
  gap: 14px;
}

.toolbar-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-radius: 18px;
  padding: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input-bar {
  width: min(440px, 46vw);
  display: flex;
  align-items: center;
  background: rgba(10, 13, 28, 0.72);
  border: 1px solid #2a2a4e;
  border-radius: 12px;
  padding: 10px 16px;
  gap: 10px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
}

.input-search-icon {
  color: #888;
  font-size: 1.2rem;
}

.main-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  color: #fff;
  font-size: 0.95rem;

  &::placeholder {
    color: #666;
  }
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid #2a2a4e;
  border-radius: 12px;
  padding: 10px 20px;
  color: #fff;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-1px);
  }
}

.select-label,
.updated-at {
  color: #98a2c7;
  font-size: 0.88rem;
  white-space: nowrap;
}

.time-select {
  width: 118px;
}

.ranking-tabs,
.metric-chips {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.ranking-tab,
.metric-chip {
  border: 1px solid rgba(102, 126, 234, 0.16);
  background: rgba(42, 42, 78, 0.82);
  color: #aeb6d5;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    border-color: rgba(102, 126, 234, 0.42);
    transform: translateY(-1px);
  }

  &.active {
    color: #fff;
    border-color: transparent;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 10px 24px rgba(102, 126, 234, 0.26);
  }
}

.ranking-tab {
  min-height: 38px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 800;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.metric-chip {
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 700;
}

.ranking-table-card {
  overflow: hidden;
  border-radius: 20px;
}

.table-header,
.ranking-row {
  display: grid;
  grid-template-columns: 72px minmax(360px, 1.45fr) minmax(130px, 0.55fr) minmax(130px, 0.55fr) minmax(132px, 0.5fr) minmax(170px, 0.7fr);
  align-items: center;
  gap: 16px;
}

.table-header {
  padding: 16px 20px;
  background: rgba(8, 11, 26, 0.72);
  color: #7f8ab6;
  font-size: 0.82rem;
  font-weight: 800;
}

.ranking-list {
  display: flex;
  flex-direction: column;
}

.ranking-row {
  min-height: 108px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.055);
  cursor: pointer;
  transition: all 0.22s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.08);
    transform: translateX(3px);
  }
}

.rank-cell {
  display: flex;
  justify-content: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.07);
  color: #cfd6f7;
  font-size: 1rem;
  font-weight: 900;
}

.rank-badge--gold {
  background: linear-gradient(135deg, #f59e0b, #fcd34d);
  color: #1a1202;
}

.rank-badge--silver {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  color: #111827;
}

.rank-badge--bronze {
  background: linear-gradient(135deg, #f97316, #fdba74);
  color: #1f1307;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.item-image-frame {
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  border: 1px solid rgba(102, 126, 234, 0.24);
  border-radius: 16px;
  background:
    radial-gradient(circle at 50% 20%, rgba(102, 126, 234, 0.28), transparent 48%),
    linear-gradient(135deg, #2a2a4e 0%, #111525 100%);
  display: grid;
  place-items: center;
}

.item-image {
  width: 86%;
  height: 86%;
  object-fit: contain;
}

.item-meta {
  min-width: 0;
}

.item-title {
  color: #f8fafc;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  margin-top: 4px;
  color: #8791b4;
  font-size: 0.82rem;
}

.item-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.status-tag {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 900;
}

.status-tag--gold {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
}

.status-tag--red {
  background: rgba(248, 113, 113, 0.14);
  color: #fca5a5;
}

.status-tag--blue {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.status-tag--green {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.status-tag--purple {
  background: rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
}

.detail-link {
  color: #8ea2ff;
  font-size: 0.76rem;
  font-weight: 800;
}

.price-cell,
.change-cell,
.sparkline-cell {
  color: #dbe4ff;
  font-size: 0.92rem;
  font-weight: 800;
}

.price-cell.strong {
  color: #f59e0b;
}

.change-cell {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #22c55e;

  &.down {
    color: #ef4444;
  }
}

.change-icon {
  width: 17px;
  height: 17px;
}

.sparkline-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #9aa3c7;
  font-size: 0.78rem;
}

.sparkline {
  width: 132px;
  height: 44px;

  polyline {
    fill: none;
    stroke: #22c55e;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.35));
  }
}

:deep(.n-layout) {
  background: transparent !important;
}

@media (max-width: 1280px) {
  .header-right {
    display: none;
  }

  .ranking-hero {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .table-header,
  .ranking-row {
    grid-template-columns: 64px minmax(320px, 1.4fr) 120px 120px 120px 150px;
  }
}

@media (max-width: 980px) {
  .nav-menu {
    overflow-x: auto;
  }

  .toolbar-card,
  .metric-row {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input-bar {
    width: 100%;
  }

  .ranking-table-card {
    overflow-x: auto;
  }

  .table-header,
  .ranking-row {
    min-width: 980px;
  }
}

@media (max-width: 640px) {
  .content {
    padding: 76px 14px 32px;
  }

  .header-content {
    padding: 0 14px;
  }

  .hero-copy {
    padding: 22px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
