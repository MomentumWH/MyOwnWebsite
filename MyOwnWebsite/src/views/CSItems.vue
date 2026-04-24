<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from "vue";
import { useRouter } from "vue-router";
import { debounce } from "lodash";
import { useElementSize } from "@vueuse/core";
import {
  NButton,
  NCard,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutSider,
  NMenu,
  NTab,
  NTabs,
  NSelect,
  NProgress,
  stepProps,
} from "naive-ui";
import {
  HomeOutline,
  ListOutline,
  TrophyOutline,
  CartOutline,
  SwapHorizontalOutline,
  FlameOutline,
  SearchOutline,
  CloseOutline,
} from "@vicons/ionicons5";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, CandlestickChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
} from "echarts/components";
import * as echarts from "echarts";
type ECharts = echarts.ECharts;
import {
  bindLocalIp,
  getCurrentData,
  getSubData,
  getKline,
  suggest,
} from "../services/CSQaQ";
import dayjs from "dayjs";
import { scale } from "@visactor/vchart/esm/vchart-all";
import { max, min } from "@visactor/vchart/esm/util";
use([
  CanvasRenderer,
  LineChart,
  CandlestickChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
]);

const DASHBOARD_DESIGN_WIDTH = 1600;
const MIN_DASHBOARD_SCALE = 0.62;

const router = useRouter();
const currentTime = ref();
let currentTimeTimer: ReturnType<typeof setInterval> | null = null;
const activeNavItem = ref("home");
const menuOptions = [
  { label: "首页", key: "home", icon: HomeOutline },
  { label: "饰品列表", key: "items", icon: ListOutline },
  { label: "排行榜", key: "ranking", icon: TrophyOutline },
  { label: "库存监控", key: "inventory", icon: CartOutline },
  { label: "挂刀行情", key: "knife", icon: SwapHorizontalOutline },
  { label: "热门系列", key: "series", icon: FlameOutline },
];

const currentTab = ref();
const tabs = [
  { key: "index", label: "饰品指数" },
  { key: "items", label: "饰品列表" },
  { key: "ranking", label: "排行榜" },
];

const showHistoryChart = ref(false);
let historyChartInstance: ECharts | null = null;

const indexTabs = ref([]);

const activeIndexTab = ref(0);

const tabsScrollWrapper = ref<HTMLElement | null>(null);
const tabsContainer = ref<HTMLElement | null>(null);
const scaleViewport = ref<HTMLElement | null>(null);
const scaleStage = ref<HTMLElement | null>(null);
const { width: scaleViewportWidth } = useElementSize(scaleViewport);
const { height: scaleStageHeight } = useElementSize(scaleStage);
const dashboardScale = computed(() => {
  if (!scaleViewportWidth.value) {
    return 1;
  }

  const nextScale = scaleViewportWidth.value / DASHBOARD_DESIGN_WIDTH;
  return Number(Math.max(MIN_DASHBOARD_SCALE, Math.min(nextScale, 1)).toFixed(4));
});
const scaleShellStyle = computed(() => ({
  height: `${Math.max(scaleStageHeight.value * dashboardScale.value, 0)}px`,
}));
const scaleStageStyle = computed(() => ({
  transform: `scale(${dashboardScale.value})`,
}));

const selectIndexObjectTab = (index: number, tab: any) => {
  activeIndexTab.value = index;
  console.log(tab);
  currentTab.value = tab;
  kLineQueryParam.value.id = tab.id;
  getKLineDataFromQueryParam();
};

const scrollTabs = (direction: number) => {
  if (tabsScrollWrapper.value) {
    const scrollAmount = 200;
    tabsScrollWrapper.value.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  }
};

const chartTabs = ref([
  //{ id: 0, name: "饰品指数" },
  { id: 1, name: "1小时", value: "1hour" },
  { id: 2, name: "4小时", value: "4hour" },
  { id: 3, name: "日线", value: "1day" },
  { id: 4, name: "周线", value: "7day" },
]);

const activeChartTab = ref(0);

const selectChartTimeTab = (index: number, tab: any) => {
  activeChartTab.value = index;
  console.log({ index: index, tab: tab });
  switch (index) {
    case 0:
      kLineQueryParam.value.type = tab.value;
      getKLineDataFromQueryParam();
      break;
    case 1:
      kLineQueryParam.value.type = tab.value;
      getKLineDataFromQueryParam();
      break;
    case 2:
      kLineQueryParam.value.type = tab.value;
      getKLineDataFromQueryParam();
      break;
    case 3:
      kLineQueryParam.value.type = tab.value;
      getKLineDataFromQueryParam();
      break;
      break;
  }
};

const itemIndexData = ref({
  current: 2149.73,
  change: 13.98,
  percent: 0.65,
  high: 2149.73,
  low: 2135.58,
});

const marketData = ref({
  online: 673347,
  yesterdayChange: 68267,
  monthChange: 95075,
  steamPrice: 551.8,
});

const hotItems = ref([]);

const goToDetail = (item: any, index: number) => {
  const id = item.id || index + 1;
  console.log(item);
  router.push({
    path: "/CsItemDetail",
    query: {
      id: id,
    },
  });
};

const searchQuery = ref("");
const showSearchDropdown = ref(false);
const searchListData = ref([]);
const isSearchLoading = ref(false);

const debounceSearch = debounce(() => {
  if (!searchQuery.value.trim()) {
    searchListData.value = [];
    return;
  }

  isSearchLoading.value = true;
  const queryParams = {
    text: searchQuery.value,
  };
  suggest(queryParams)
    .then((res) => {
      searchListData.value = res.data;
      //filteredItems.value = res.data;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      isSearchLoading.value = false;
    });
}, 1000);
// const filteredItems = computed(() => {
//   if (!searchQuery.value.trim()) return [];
//   return hotItems.value.filter((item) =>
//     item.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
//   );
// });

const handleSearchFocus = () => {
  showSearchDropdown.value = true;
};

const handleSearchBlur = () => {
  setTimeout(() => {
    showSearchDropdown.value = false;
  }, 200);
};

const clearSearch = () => {
  searchQuery.value = "";
  showSearchDropdown.value = false;
};

const selectItem = (item: any) => {
  searchQuery.value = item.name;
  showSearchDropdown.value = false;
  const index = hotItems.value.findIndex((i) => i.id === item.id);
  goToDetail(item, index !== -1 ? index : 0);
};

let chartInstance: ECharts | null = null;
//绑定本机白名单IP
const bindIp = async () => {
  await bindLocalIp();
};
const heatObjectData = ref([]);
const hotTrend = ref();
const initChart = () => {
  const chartDom = document.getElementById("price-chart");
  if (!chartDom) return;

  import("echarts").then((echarts) => {
    chartInstance = echarts.init(chartDom);
    const option = {
      backgroundColor: "#1a1a2e",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#667eea",
      },
      grid: {
        left: "5%",
        right: "5%",
        bottom: "10%",
        top: "8%",
      },
      xAxis: {
        type: "category",
        data: kLineData.value.map((k) => k.t),
        axisLine: { lineStyle: { color: "#667eea" } },
        axisLabel: { color: "#aaa" },
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLine: { lineStyle: { color: "#667eea" } },
        axisLabel: { color: "#aaa" },
        splitLine: { lineStyle: { color: "#2a2a4e" } },
      },
      dataZoom: [
        {
          type: "inside",
          start: 50,
          end: 100,
        },
        {
          show: true,
          type: "slider",
          bottom: "0%",
          start: 50,
          end: 100,
          borderColor: "#667eea",
          backgroundColor: "#1a1a2e",
          fillerColor: "rgba(102, 126, 234, 0.3)",
          handleStyle: { color: "#667eea" },
        },
      ],
      series: [
        {
          name: "价格",
          type: "candlestick",
          data: kLineData.value.map((k) => [
            parseFloat(k.o),
            parseFloat(k.c),
            parseFloat(k.l),
            parseFloat(k.h),
          ]),
          itemStyle: {
            color: "#14b8a6",
            color0: "#ef4444",
            borderColor: "#14b8a6",
            borderColor0: "#ef4444",
          },
        },
      ],
    };

    chartInstance.setOption(option);
  });
};

const initOnlineChart = () => {
  const chartDom = document.getElementById("online-chart");
  if (!chartDom) return;
  import("echarts").then((echarts) => {
    const onlineChart = echarts.init(chartDom);
    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        // generateOnlineData().map((d) => d.value[0]),
        data: onlineChartData2.value?.map((item) => item.d),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#888", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#888", fontSize: 10 },
        splitLine: { lineStyle: { color: "#333" } },
      },
      series: [
        {
          name: "在线人数",
          type: "line",
          smooth: true,
          symbol: "none",
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(102, 126, 234, 0.5)" },
                { offset: 1, color: "rgba(102, 126, 234, 0.05)" },
              ],
            },
          },
          lineStyle: { color: "#667eea", width: 2 },
          data: onlineChartData2.value?.map((item) => item.m),
          // generateOnlineData().map((d) => d.value[1]),
        },
      ],
    };

    onlineChart.setOption(option);
  });
};
const currentSelectMode = ref();
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
  if (historyChartInstance) {
    historyChartInstance.resize();
  }
  if (priceChartInstance) {
    priceChartInstance.resize();
  }
};
const kLineQueryParam = ref({
  id: 1,
  type: "1day",
});
const getKLineDataFromQueryParam = () => {
  getKline(kLineQueryParam.value).then((res) => {
    kLineData.value = res.data;
    kLineData.value.map(
      (item) => (item.t = dayjs(Number(item.t)).format("YYYY-MM-DD")),
    );
    initChart();
  });
};
const goHome = () => {
  router.push("/");
};

const handleNavClick = (item: any) => {
  activeNavItem.value = item.key;
  if (item.key === "home") {
    router.push("/cs-items");
  } else if (item.key === "items") {
    router.push("/item-list");
  }
};

const toggleHistoryChart = () => {
  showHistoryChart.value = !showHistoryChart.value;
  if (showHistoryChart.value) {
    setTimeout(() => {
      initHistoryChart();
    }, 100);
  }
};
// const
const initHistoryChart = () => {
  const chartDom = document.getElementById("history-chart");
  if (!chartDom) return;

  import("echarts").then((echarts) => {
    historyChartInstance = echarts.init(chartDom);
    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#667eea",
      },
      legend: {
        data: ["热度", "大盘指数"],
        textStyle: { color: "#fff", fontSize: 14 },
        top: 10,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: heatLineData.value.map((d) => d[0]),
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#333" } },
        axisTick: { show: false },
        axisLabel: { color: "#888", fontSize: 12 },
      },
      yAxis: [
        {
          name: "热度",
          scale: true,
          min: 0,
          max: 200,
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#888", fontSize: 12 },
          splitLine: { lineStyle: { color: "#2a2a4e", type: "dashed" } },
        },
        {
          type: "value",
          name: "大盘指数",
          position: "right",
          scale: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#888", fontSize: 12, formatter: "{value}" },
          splitLine: { lineStyle: { color: "#2a2a4e", type: "dashed" } },
        },
      ],
      series: [
        {
          name: "热度",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          data: heatLineData.value.map((d) => d[1]),
          lineStyle: { color: "#ef4444", width: 3 },
          itemStyle: { color: "#ef4444" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(239, 68, 68, 0.3)" },
                { offset: 1, color: "rgba(239, 68, 68, 0)" },
              ],
            },
          },
        },
        {
          name: "大盘指数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          data: kLineData.value.slice(-60).map((d) => d.c),
          lineStyle: { color: "#667eea", width: 3 },
          itemStyle: { color: "#667eea" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(102, 126, 234, 0.3)" },
                { offset: 1, color: "rgba(102, 126, 234, 0)" },
              ],
            },
          },
        },
      ],
    };

    historyChartInstance.setOption(option);
  });
};
const heatLineData = ref();
const kLineData = ref();
const onlineChartData = ref([]);
const onlineChartData2 = ref([]);
const onlineData = ref();

const activeRankingTab = ref("type");
const showAllRanking = ref(false);

const typeRankingData = ref([
  { rank: 1, name: "工具", icon: "", change: 8.35, isUp: true },
  { rank: 2, name: "MP5-SD", icon: "", change: -1.69, isUp: false },
  { rank: 3, name: "手部束带", icon: "", change: -1.49, isUp: false },
  { rank: 4, name: "专业手套", icon: "", change: -1.44, isUp: false },
  { rank: 5, name: "法玛斯", icon: "", change: -1.32, isUp: false },
  { rank: 6, name: "摩托手套", icon: "", change: -1.27, isUp: false },
  { rank: 7, name: "猎杀者匕首", icon: "", change: -1.06, isUp: false },
]);

const priceSegmentData = ref([
  { name: "中小件", value: 30, change: -0.3, color: "#60a5fa" },
  { name: "小件", value: 15, change: -0.2, color: "#f472b6" },
  { name: "大件", value: 25, change: -0.02, color: "#a78bfa" },
  { name: "中件", value: 20, change: -0.38, color: "#f8b4b4" },
  { name: "中大件", value: 18, change: -0.33, color: "#fcd34d" },
]);

const riseFallData = ref({
  rise: 4008,
  flat: 11751,
  fall: 9589,
});

let priceChartInstance: ECharts | null = null;

const initPriceChart = () => {
  const chartDom = document.getElementById("price-segment-chart");
  if (!chartDom) return;
  import("echarts").then((echarts) => {
    priceChartInstance = echarts.init(chartDom);
    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#333",
      },
      legend: {
        show: false,
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: "#1a1a2e",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              color: "#fff",
            },
          },
          labelLine: {
            show: true,
            length: 20,
            length2: 30,
            lineStyle: {
              color: "#aaa",
            },
          },
          data: priceSegmentData.value.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color },
          })),
        },
      ],
    };
    priceChartInstance.setOption(option);
  });
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "#ef4444";
    case 2:
      return "#f97316";
    case 3:
      return "#f59e0b";
    default:
      return "#888";
  }
};

const getBarWidth = (type: string) => {
  const total =
    riseFallData.value.rise + riseFallData.value.flat + riseFallData.value.fall;
  if (type === "rise") {
    return (riseFallData.value.rise / total) * 100;
  } else if (type === "flat") {
    return (riseFallData.value.flat / total) * 100;
  } else {
    return (riseFallData.value.fall / total) * 100;
  }
};
const handleWindowResize = () => {
  resizeChart();
};
onMounted(() => {
  hotItems.value = hotItems.value.map((item, index) => ({
    ...item,
    id: index + 1,
  }));
  currentTimeTimer = setInterval(() => {
    currentTime.value = dayjs(Date.now()).format("YYYY年MM月DD日 HH:mm:ss");
    //console.log({ currentTime: currentTime.value });
  }, 1000);
  //bindIp();
  getCurrentData("init")
    .then((res) => {
      console.log({ res: res });
      indexTabs.value = res.data.sub_index_data;
      onlineChartData.value = res.data.online_chart;
      onlineChartData2.value = res.data.online_chart?.reverse();
      onlineData.value = res.data.online_number;
      hotTrend.value = res.data.greedy_status;
      hotTrend.value.trendNumber =
        res.data.greedy[res.data.greedy.length - 1][1];
      currentTab.value = indexTabs.value[0];
      heatLineData.value = res.data.greedy;
      heatObjectData.value = res.data.view_count;
      initOnlineChart();
    })
    .catch((err) => {});
  //indexTabs.value=res。

  let data = {
    //id:1,
    type: "daily",
  };
  let data2 = {
    id: 1,
    type: "1day",
  };
  setTimeout(() => {
    getSubData(data);
  }, 3000);
  setTimeout(() => {
    getKline(data2).then((res) => {
      kLineData.value = res.data;
      kLineData.value.map((item) => {
        item.t = dayjs(Number(item.t)).format("YYYY-MM-DD");
      });
      initChart();
    });
  }, 1000);

  setTimeout(() => {
    initPriceChart();
  }, 500);

  //getCurrentData()
  window.addEventListener("resize", handleWindowResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
  if (currentTimeTimer) {
    clearInterval(currentTimeTimer);
  }
  if (chartInstance) {
    chartInstance.dispose();
  }
  if (historyChartInstance) {
    historyChartInstance.dispose();
  }
  if (priceChartInstance) {
    priceChartInstance.dispose();
  }
});
</script>

<template>
  <n-layout class="cs-items-page">
    <n-layout-header bordered class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <span class="logo-text">CS</span>
          <span class="logo-accent">饰品</span>
        </div>
        <div class="nav-menu">
          <div
            v-for="item in menuOptions"
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
                placeholder="搜索饰品名称..."
                class="search-input"
                @focus="handleSearchFocus"
                @blur="handleSearchBlur"
                @input="debounceSearch"
              />
              <n-icon
                v-if="searchQuery"
                class="clear-icon"
                @click.stop="clearSearch"
              >
                <CloseOutline />
              </n-icon>
            </div>
            <div
              v-if="
                showSearchDropdown &&
                (searchListData.length > 0 || isSearchLoading)
              "
              class="search-dropdown"
            >
              <div v-if="isSearchLoading" class="search-loading">
                <div class="loading-spinner"></div>
                <span class="loading-text">搜索中...</span>
              </div>
              <transition-group name="list" tag="div" v-else>
                <div
                  v-for="item in searchListData"
                  :key="item.id"
                  class="search-dropdown-item"
                  @mousedown="selectItem(item)"
                >
                  <n-icon class="dropdown-icon">
                    <SearchOutline />
                  </n-icon>
                  <span class="dropdown-text">{{ item.value }}</span>
                </div>
              </transition-group>
            </div>
          </div>
          <n-button quaternary class="header-btn">登录</n-button>
          <n-button type="primary" class="header-btn">注册</n-button>
          <n-button
            type="primary"
            class="header-btn"
            @click="goHome"
            style="
              margin-left: 8px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
            "
          >
            ← 返回首页
          </n-button>
        </div>
      </div>
    </n-layout-header>

    <n-layout-content class="main-content">
      <div ref="scaleViewport" class="content-scale-shell" :style="scaleShellStyle">
        <div ref="scaleStage" class="content-scale-stage" :style="scaleStageStyle">
          <div class="content-wrapper">
        <div class="top-section fade-in-section" style="animation-delay: 0.2s">
          <div class="left-panel">
            <div
              class="index-card fade-in-section"
              style="animation-delay: 0.4s"
            >
              <div class="index-header">
                <div class="index-title">
                  <h2>
                    {{ currentTab?.name ? currentTab?.name : "--" }}
                  </h2>
                  <span class="time-range">⟳ 连续3天</span>
                </div>
                <div class="index-time">
                  <span>{{ currentTime }}</span>
                  <span>当前时间</span>
                </div>
              </div>
              <div class="index-data">
                <div class="index-main">
                  <div class="index-value">
                    {{
                      currentTab?.market_index ? currentTab?.market_index : "--"
                    }}
                  </div>
                  <div
                    class="index-change"
                    :class="currentTab?.chg_num >= 0 ? 'up' : 'down'"
                  >
                    <span class="change-arrow">{{
                      currentTab?.chg_num >= 0 ? "↑" : "↓"
                    }}</span>
                    <span>{{
                      currentTab?.chg_num ? currentTab?.chg_num : "--"
                    }}</span>
                    <span class="change-percent"
                      >（{{ currentTab?.chg_rate > 0 ? "+" : ""
                      }}{{
                        currentTab?.chg_rate ? currentTab?.chg_rate : "--"
                      }}%）</span
                    >
                  </div>
                </div>
                <div class="index-range">
                  <div class="range-item">
                    <span class="range-label">今日最高</span>
                    <span class="range-value">{{
                      currentTab?.high ? currentTab?.high : "--"
                    }}</span>
                  </div>
                  <div class="range-item">
                    <span class="range-label">今日最低</span>
                    <span class="range-value">{{
                      currentTab?.low ? currentTab?.low : "--"
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="index-tabs-container">
                <button class="scroll-btn scroll-left" @click="scrollTabs(-1)">
                  <span>‹</span>
                </button>
                <div class="index-tabs-scroll-wrapper" ref="tabsScrollWrapper">
                  <div class="index-tabs" ref="tabsContainer">
                    <div
                      v-for="(tab, index) in indexTabs"
                      :key="tab.id"
                      class="tab-item"
                      :class="{ active: activeIndexTab === index }"
                      @click="selectIndexObjectTab(index, tab)"
                    >
                      <img class="tab-icon" :src="tab.img" :alt="tab.name" />
                      <div class="tab-content">
                        <span class="tab-name">{{ tab.name }}</span>
                        <span
                          class="tab-change"
                          :class="{
                            up: tab?.chg_rate > 0,
                            down: tab?.chg_rate < 0,
                          }"
                        >
                          {{ tab?.chg_rate > 0 ? "+" : "" }}{{ tab?.chg_rate }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button class="scroll-btn scroll-right" @click="scrollTabs(1)">
                  <span>›</span>
                </button>
              </div>
            </div>

            <div
              class="chart-card fade-in-section"
              style="animation-delay: 0.6s"
            >
              <div class="chart-header">
                <div class="chart-tabs-scroll-wrapper">
                  <div class="chart-tabs">
                    <div
                      style="
                        padding: 0px 0px;
                        font-size: 24px;
                        margin-right: 24px;
                      "
                    >
                      饰品指数K线
                    </div>
                    <div
                      v-for="(tab, index) in chartTabs"
                      :key="tab.id"
                      class="chart-tab"
                      :class="{ active: activeChartTab === index }"
                      @click="selectChartTimeTab(index, tab)"
                    >
                      {{ tab.name }}
                    </div>
                  </div>
                </div>
                <div class="chart-tools">
                  <span class="tool-item">MA</span>
                  <span class="tool-item">指标</span>
                  <span class="tool-item">设置</span>
                  <span class="tool-item">截屏</span>
                  <span class="tool-item">全屏</span>
                </div>
              </div>
              <div id="price-chart" class="price-chart"></div>
            </div>
          </div>

          <div
            class="right-panel fade-in-section"
            style="animation-delay: 0.8s"
          >
            <div
              class="market-card fade-in-section"
              style="animation-delay: 1s"
            >
              <div class="market-header">
                <h3 v-if="!showHistoryChart">市场热度监测</h3>
                <h3 v-else>历史市场热度</h3>
                <span class="market-time" @click="toggleHistoryChart">
                  {{ showHistoryChart ? "返回卡片" : "历史数据" }}
                  <span class="toggle-icon">{{
                    showHistoryChart ? "↑" : ""
                  }}</span>
                </span>
              </div>
              <div>
                <div class="market-desc" v-if="!showHistoryChart">
                  <span class="desc-label">当前热度趋势</span>
                  <span class="desc-value"
                    >{{
                      hotTrend?.trendNumber ? hotTrend?.trendNumber : "--"
                    }}（{{ hotTrend?.label ? hotTrend?.label : "--" }}）</span
                  >
                </div>
                <div class="market-desc-small" v-if="!showHistoryChart">
                  根据市场社区相关数据综合计算得出
                </div>
                <div class="history-chart-section" v-if="showHistoryChart">
                  <div id="history-chart" class="history-chart"></div>
                </div>
                <div class="online-section">
                  <div class="online-header">
                    <div>
                      <h4>当前在线人数</h4>
                      <span class="online-time">{{ currentTime }}</span>
                    </div>
                    <div class="online-badge">📈</div>
                  </div>
                  <div class="online-number">
                    {{
                      onlineData?.current_number
                        ? onlineData.current_number
                        : "--"
                    }}
                    人
                  </div>
                  <div class="online-stats">
                    <div class="stat-item">
                      <span class="stat-label">昨日同时段</span>
                      <span
                        class="stat-value up"
                        v-if="
                          onlineData?.current_number >
                          onlineData?.same_time_number
                        "
                        >↑
                        {{
                          onlineData?.same_time_number
                            ? onlineData?.same_time_number
                            : "--"
                        }}</span
                      >
                      <span
                        class="stat-percent up"
                        v-if="
                          onlineData?.current_number >
                          onlineData?.same_time_number
                        "
                        >{{ "+" + onlineData.rate + "%" }}</span
                      >
                      <span
                        class="stat-value down"
                        v-if="
                          onlineData?.current_number <
                          onlineData?.same_time_number
                        "
                        >↓
                        {{
                          onlineData?.same_time_number
                            ? onlineData?.same_time_number
                            : "--"
                        }}</span
                      >
                      <span
                        class="stat-percent down"
                        v-if="
                          onlineData?.current_number <
                          onlineData?.same_time_number
                        "
                        >{{ onlineData.rate + "%" }}</span
                      >
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">上周同时段</span>
                      <span
                        class="stat-value up"
                        v-if="
                          onlineData?.current_number >
                          onlineData?.same_time_number_week
                        "
                        >↑
                        {{
                          onlineData?.same_time_number_week
                            ? onlineData?.same_time_number_week
                            : "--"
                        }}</span
                      >
                      <span
                        class="stat-percent up"
                        v-if="
                          onlineData?.current_number >
                          onlineData?.same_time_number_week
                        "
                        >{{ "+" + onlineData?.rate_week + "%" }}</span
                      >
                      <span
                        class="stat-value down"
                        v-if="
                          onlineData?.current_number <
                          onlineData?.same_time_number_week
                        "
                        >↓
                        {{
                          onlineData?.same_time_number_week
                            ? onlineData?.same_time_number_week
                            : "--"
                        }}</span
                      >
                      <span
                        class="stat-percent down"
                        v-if="
                          onlineData?.current_number <
                          onlineData?.same_time_number_week
                        "
                        >{{ onlineData?.rate_week + "%" }}</span
                      >
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">全球月活玩家</span>
                      <span
                        class="stat-value up"
                        v-if="
                          onlineData?.month_player -
                            onlineData?.same_month_player >
                          0
                        "
                        >↑
                        {{
                          onlineData?.month_player
                            ? onlineData?.month_player
                            : "--"
                        }}</span
                      >
                      <span
                        class="stat-percent up"
                        v-if="
                          onlineData?.month_player -
                            onlineData?.same_month_player >
                          0
                        "
                        >{{
                          "+" +
                          (
                            (onlineData?.month_player -
                              onlineData?.same_month_player) /
                            10000
                          ).toFixed(2)
                        }}万人
                      </span>
                      <span
                        class="stat-value up"
                        v-if="
                          onlineData?.month_player -
                            onlineData?.same_month_player <
                          0
                        "
                        >↑
                        {{
                          onlineData?.month_player
                            ? onlineData?.month_player
                            : "--"
                        }}</span
                      >
                      <span
                        class="stat-percent down"
                        v-if="
                          onlineData?.month_player -
                            onlineData?.same_month_player <
                          0
                        "
                        >{{
                          (
                            (onlineData?.month_player -
                              onlineData?.same_month_player) /
                            10000
                          ).toFixed(2)
                        }}万人
                      </span>
                    </div>
                  </div>
                  <div id="online-chart" class="online-chart"></div>
                  <div class="online-summary">
                    <div class="summary-item">
                      <span class="summary-label">昨日在线峰值</span>
                      <span class="summary-value"
                        >{{
                          onlineChartData[1]?.m ? onlineChartData[1]?.m : "--"
                        }}
                        人</span
                      >
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">本月在线峰值</span>
                      <span class="summary-value"
                        >{{
                          onlineData?.month_peak ? onlineData?.month_peak : "--"
                        }}
                        人</span
                      >
                    </div>
                  </div>
                </div>
                <!-- 
                <div class="steam-section">
                  <div class="steam-header">
                    <h4>Steam卡价</h4>
                    <div class="steam-tabs">
                      <span class="steam-tab active">历史</span>
                      <span class="steam-tab">客户端</span>
                    </div>
                  </div>
                  <div class="steam-price">
                    <div class="price-label">今日均价</div>
                    <div class="price-value">
                      ¥ {{ marketData.steamPrice }} / 100$
                    </div>
                    <div class="price-note">美元区</div>
                  </div>
                  <div class="steam-hint">
                    受手续费汇率等波动影响，价格仅供参考
                  </div>
                </div> -->

                <div class="ranking-section">
                  <div class="ranking-header">
                    <h4>涨跌分布</h4>
                    <div class="ranking-tabs">
                      <span
                        class="ranking-tab"
                        :class="{ active: activeRankingTab === 'type' }"
                        @click="activeRankingTab = 'type'"
                      >
                        饰品类型
                      </span>
                      <span
                        class="ranking-tab"
                        :class="{ active: activeRankingTab === 'price' }"
                        @click="activeRankingTab = 'price'"
                      >
                        价格板块
                      </span>
                    </div>
                  </div>

                  <div class="ranking-content">
                    <div
                      v-if="activeRankingTab === 'type'"
                      class="type-ranking"
                    >
                      <div class="ranking-list-header">
                        <span class="header-rank">排名/系列名</span>
                        <span class="header-change">涨跌幅</span>
                      </div>
                      <div class="ranking-list">
                        <div
                          v-for="(item, index) in showAllRanking
                            ? typeRankingData
                            : typeRankingData.slice(0, 3)"
                          :key="item.rank"
                          class="ranking-item"
                        >
                          <span
                            class="rank-number"
                            :style="{ color: getRankColor(item.rank) }"
                          >
                            {{ item.rank }}
                          </span>
                          <div class="item-icon"></div>
                          <span class="item-name">{{ item.name }}</span>
                          <span
                            class="item-change"
                            :class="{ up: item.isUp, down: !item.isUp }"
                          >
                            <span v-if="item.isUp" class="change-icon">▲</span>
                            <span v-else class="change-icon">▼</span>
                            {{ Math.abs(item.change) }}%
                          </span>
                        </div>
                      </div>
                      <div
                        v-if="typeRankingData.length > 4"
                        class="show-more"
                        @click="showAllRanking = !showAllRanking"
                      >
                        <span>{{ showAllRanking ? "收起" : "查看更多" }}</span>
                        <span class="arrow" :class="{ up: showAllRanking }"
                          >▼</span
                        >
                      </div>
                    </div>

                    <div
                      v-if="activeRankingTab === 'price'"
                      class="price-segment"
                    >
                      <div class="price-chart-wrapper">
                        <div class="chart-container">
                          <div
                            id="price-segment-chart"
                            class="price-chart"
                          ></div>
                        </div>
                        <div class="price-labels">
                          <div
                            v-for="(item, index) in priceSegmentData"
                            :key="index"
                            class="price-label-item"
                            :style="{ color: item.color }"
                          >
                            <span class="label-name">{{ item.name }}</span>
                            <span class="label-change">{{ item.change }}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="rise-fall-summary">
                    <div class="summary-item rise">
                      <span class="summary-label">上涨</span>
                      <span class="summary-value"
                        >{{ riseFallData.rise }}种</span
                      >
                    </div>
                    <div class="summary-item flat">
                      <span class="summary-label">持平</span>
                      <span class="summary-value"
                        >{{ riseFallData.flat }}种</span
                      >
                    </div>
                    <div class="summary-item fall">
                      <span class="summary-label">下跌</span>
                      <span class="summary-value"
                        >{{ riseFallData.fall }}种</span
                      >
                    </div>
                  </div>

                  <div class="rise-fall-bar">
                    <div
                      class="bar-segment rise"
                      :style="{ width: getBarWidth('rise') + '%' }"
                    ></div>
                    <div
                      class="bar-segment flat"
                      :style="{ width: getBarWidth('flat') + '%' }"
                    ></div>
                    <div
                      class="bar-segment fall"
                      :style="{ width: getBarWidth('fall') + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BoneyardSkeleton
          name="blog-card"
          :loading="isLoading"
        ></BoneyardSkeleton>
        <div
          class="hot-items-section fade-in-section"
          style="animation-delay: 1.2s"
        >
          <div
            class="section-header fade-in-section"
            style="animation-delay: 1.4s"
          >
            <h3>热门饰品</h3>
          </div>
          <div class="items-grid fade-in-section" style="animation-delay: 1.6s">
            <div
              v-for="(item, index) in heatObjectData"
              :key="index"
              class="item-card fade-in-section"
              :style="{ animationDelay: `${1.8 + index * 0.2}s` }"
              @click="goToDetail(item, index)"
            >
              <!-- <div class="item-tag" :class="item.tagType">
                {{ item.tag }}
              </div> -->
              <div class="item-image-wrapper">
                <img class="item-image" :src="item.img" :alt="item.name" />
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <div class="item-bottom">
                  <div class="item-price">
                    <span class="price-label">热度排名</span>
                    <span class="price-value">{{ item.rank_num }}</span>
                  </div>
                  <div class="item-stock">
                    热度上升{{ item.rank_num_change }}名
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped lang="scss">
.cs-items-page {
  min-height: 100vh;
  width: 100%;
  background: #0d0d1a;
  color: #fff;
}

.header {
  background: #1a1a2e;
  border-bottom: 1px solid #2a2a4e;
  height: 60px;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-section {
  opacity: 0;
  animation: fadeInUp 0.8s ease forwards;
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
  margin: 0 40px;
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
  background: #2a2a4e;
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

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #1a1a2e;
  border: 1px solid #2a2a4e;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  max-height: 320px;
  overflow-y: auto;
}

.search-dropdown::-webkit-scrollbar {
  width: 6px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: #1a1a2e;
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: #3a3a5e;
  border-radius: 3px;
}

.search-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #2a2a4e;
  }
}

.dropdown-icon {
  color: #667eea;
  font-size: 1rem;
  flex-shrink: 0;
}

.dropdown-text {
  color: #fff;
  font-size: 0.9rem;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #2a2a4e;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #888;
  font-size: 0.9rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-move {
  transition: transform 0.3s ease;
}

.header-btn {
  border-radius: 8px;
}

.main-content {
  background: #0d0d1a;
  width: 100%;
  min-height: 100vh;
  padding-top: 60px;
  overflow-x: hidden;
}

.content-scale-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.content-scale-stage {
  width: 1600px;
  transform-origin: top center;
  will-change: transform;
}

.content-wrapper {
  width: 1600px;
  max-width: 1600px;
  margin: 0;
  padding: 24px;
  box-sizing: border-box;
}

.top-section {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  margin-bottom: 32px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.right-panel {
  display: flex;
  flex-direction: column;
}

.index-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #2a2a4e;
  display: flex;
  flex-direction: column;
}

.index-data {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.index-tabs-container {
  flex-shrink: 0;
  margin-top: auto;
}

.index-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.index-title {
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .time-range {
    padding: 4px 12px;
    background: #2a2a4e;
    border-radius: 12px;
    font-size: 0.85rem;
    color: #aaa;
  }
}

.index-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.85rem;
  color: #666;
}

.index-data {
  margin-bottom: 20px;
}

.index-main {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 16px;
}

.index-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
}

.index-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.1rem;

  &.up {
    color: #14b8a6;
  }

  &.down {
    color: #ef4444;
  }

  .change-arrow {
    font-size: 1.3rem;
  }

  .change-percent {
    font-size: 0.9rem;
    opacity: 0.8;
  }
}

.index-range {
  display: flex;
  gap: 32px;
}

.range-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .range-label {
    font-size: 0.85rem;
    color: #666;
  }

  .range-value {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
  }
}

.index-tabs-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #2a2a4e;
  color: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: #3a3a5e;
  }

  span {
    display: block;
    line-height: 1;
  }
}

.index-tabs-scroll-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-width: 0;

  &::-webkit-scrollbar {
    display: none;
  }
}

.index-tabs {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  width: max-content;
}

.tab-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2a2a4e;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: auto;

  &:hover {
    background: #3a3a5e;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .tab-icon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tab-name {
    font-size: 0.8rem;
    color: #fff;
    text-align: left;
    white-space: nowrap;
  }

  .tab-change {
    font-size: 0.7rem;

    &.up {
      color: #14b8a6;
    }

    &.down {
      color: #ef4444;
    }
  }
}

.chart-card {
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid #2a2a4e;
  overflow: hidden;
  flex: 1;
  min-height: 500px;
  min-width: 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a4e;
}

.chart-tabs-scroll-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.chart-tabs {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  min-width: max-content;
}

.chart-tab {
  font-size: 0.9rem;
  color: #888;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  background: #2a2a4e;
  transition: all 0.3s ease;

  &:hover {
    background: #3a3a5e;
    color: #fff;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-weight: 600;
  }
}

.chart-tools {
  display: flex;
  gap: 16px;
}

.tool-item {
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #fff;
  }
}

.price-chart {
  width: 100%;
  height: calc(100% - 120px);
  margin-bottom: 20px;
  min-width: 0;
  overflow: hidden;
}

.market-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #2a2a4e;
  //height: 100%;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
}

.market-time {
  font-size: 0.85rem;
  color: #667eea;
  cursor: pointer;
}

.market-desc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .desc-label {
    font-size: 0.9rem;
    color: #aaa;
  }

  .desc-value {
    font-size: 0.9rem;
    color: #f59e0b;
  }
}

.market-desc-small {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 24px;
}

.online-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a4e;
}

.online-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .online-time {
    font-size: 0.8rem;
    color: #666;
  }
}

.online-badge {
  font-size: 1.5rem;
}

.online-number {
  font-size: 2rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 16px;
}

.online-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;

  .stat-label {
    color: #666;
  }

  .stat-value {
    color: #fff;

    &.up {
      color: #14b8a6;
    }

    &.down {
      color: #ef4444;
    }
  }

  .stat-percent {
    padding: 2px 8px;
    background: #2a2a4e;
    border-radius: 4px;
    font-size: 0.75rem;

    &.up {
      color: #14b8a6;
    }

    &.down {
      color: #ef4444;
    }
  }
}

.online-chart {
  width: 100%;
  height: 150px;
  margin-bottom: 16px;
}

.online-summary {
  display: flex;
  gap: 16px;
}

.summary-item {
  flex: 1;
  padding: 12px;
  background: #2a2a4e;
  border-radius: 8px;
  text-align: center;

  .summary-label {
    display: block;
    font-size: 0.75rem;
    color: #666;
    margin-bottom: 4px;
  }

  .summary-value {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
  }
}

.steam-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a4e;
}

.steam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
}

.steam-tabs {
  display: flex;
  gap: 12px;
}

.steam-tab {
  padding: 4px 12px;
  background: #2a2a4e;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;

  &.active {
    background: #667eea;
    color: #fff;
  }
}

.steam-price {
  text-align: center;
  margin-bottom: 8px;

  .price-label {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 4px;
  }

  .price-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #f59e0b;
    margin-bottom: 4px;
  }

  .price-note {
    display: block;
    font-size: 0.8rem;
    color: #666;
  }
}

.steam-hint {
  font-size: 0.75rem;
  color: #666;
  text-align: center;
}

.ranking-section {
  padding: 20px;
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid #2a2a4e;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h4 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #aaa;
  }
}

.ranking-tabs {
  display: flex;
  gap: 8px;
}

.ranking-tab {
  padding: 8px 20px;
  background: transparent;
  border-radius: 6px;
  font-size: 1rem;
  color: #aaa;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

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

  &:hover:not(.active) {
    color: #fff;
  }
}

.ranking-content {
  margin-bottom: 24px;
}

.type-ranking {
  .ranking-list-header {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 8px;

    .header-rank {
      color: #aaa;
      font-size: 0.95rem;
    }

    .header-change {
      color: #aaa;
      font-size: 0.95rem;
    }
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .rank-number {
      font-size: 1.2rem;
      font-weight: 700;
      width: 32px;
      text-align: center;
    }

    .item-icon {
      width: 40px;
      height: 40px;
      background: #2a2a4e;
      border-radius: 50%;
    }

    .item-name {
      flex: 1;
      color: #667eea;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .item-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 1.1rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 6px;

      &.up {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.15);
      }

      &.down {
        color: #14b8a6;
        background: rgba(20, 184, 166, 0.15);
      }

      .change-icon {
        font-size: 0.9rem;
      }
    }
  }

  .show-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    cursor: pointer;
    color: #aaa;
    font-size: 1rem;
    transition: color 0.2s ease;

    &:hover {
      color: #fff;
    }

    .arrow {
      transition: transform 0.3s ease;

      &.up {
        transform: rotate(180deg);
      }
    }
  }
}

.price-segment {
  .price-chart-wrapper {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
  }

  .chart-container {
    flex: 1;
    height: 200px;
  }

  .price-chart {
    width: 100%;
    height: 100%;
  }

  .price-labels {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .price-label-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 1rem;

    .label-name {
      font-weight: 500;
    }

    .label-change {
      font-size: 1.1rem;
      font-weight: 600;
    }
  }
}

.rise-fall-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .summary-label {
      font-size: 1rem;
      color: #aaa;
    }

    .summary-value {
      font-size: 1.2rem;
      font-weight: 600;
    }

    &.rise {
      .summary-value {
        color: #ef4444;
      }
    }

    &.flat {
      .summary-value {
        color: #aaa;
      }
    }

    &.fall {
      .summary-value {
        color: #14b8a6;
      }
    }
  }
}

.rise-fall-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;

  .bar-segment {
    height: 100%;
    transition: width 0.3s ease;

    &.rise {
      background: #ef4444;
    }

    &.flat {
      background: #444;
    }

    &.fall {
      background: #14b8a6;
    }
  }
}

.hot-items-section {
  margin-top: 32px;
}

.section-header {
  margin-bottom: 24px;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.item-card {
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2a4e;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }
}

.item-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 10;
  color: #fff;

  &.factory-new {
    background: #22c55e;
  }

  &.field-tested {
    background: #3b82f6;
  }

  &.holo {
    background: #fff;
    color: #333;
  }

  &.battle-scarred {
    background: #f97316;
  }
}

.item-image-wrapper {
  width: 100%;
  padding-top: 100%;
  position: relative;
  background: linear-gradient(135deg, #2a2a4e 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  height: 85%;
  object-fit: contain;
}

.item-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.item-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: #fff;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: auto;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .price-label {
    font-size: 0.9rem;
    color: #f59e0b;
    font-weight: 600;
  }

  .price-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f59e0b;
  }
}

.item-stock {
  font-size: 0.8rem;
  color: #888;
}

.market-time {
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 8px;
  background: #2a2a4e;
  color: #667eea;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #3a3a5e;
  }
}

.toggle-icon {
  font-size: 1rem;
  line-height: 1;
}

.history-chart-section {
  padding: 16px 0;
  height: 250px;
}

.history-chart {
  width: 100%;
  height: 250px;
}
</style>
