<template>
  <n-layout class="item-detail-page" content-style="min-height: 100vh">
    <n-layout-header class="header">
      <div class="header-content">
        <div class="logo">
          <n-icon size="28">
            <GameController />
          </n-icon>
          <span>CS饰品市场</span>
        </div>
        <div class="nav-actions">
          <n-button quaternary @click="goBack" class="back-button">
            <template #icon>
              <n-icon><ArrowBack /></n-icon>
            </template>
            返回
          </n-button>
          <n-space>
            <n-button quaternary>
              <template #icon>
                <n-icon><NotificationsOutline /></n-icon>
              </template>
            </n-button>
            <n-button quaternary>
              <template #icon>
                <n-icon><SettingsOutline /></n-icon>
              </template>
            </n-button>
            <n-avatar round>U</n-avatar>
          </n-space>
        </div>
      </div>
    </n-layout-header>

    <n-layout-content class="content">
      <div class="detail-container">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <span class="loading-text">加载中...</span>
          </div>
        </div>
        <div v-if="item" class="detail-wrapper fade-in-section">
          <div class="detail-header">
            <div class="item-image-section">
              <img
                :src="item.goods_info.img"
                :alt="item.goods_info.name"
                class="item-main-image"
              />
            </div>

            <div class="item-info-section">
              <div class="item-title-row">
                <h1 class="item-name">{{ item.goods_info.name }}</h1>
              </div>

              <div class="item-meta">
                <div class="meta-item">
                  <span class="meta-label">属性</span>
                  <span class="meta-value"
                    >{{ item.goods_info.rarity_localized_name }}
                    {{ item.goods_info.type_localized_name }}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label">存世量</span>
                  <span class="meta-value">{{
                    item.goods_info.statistic
                  }}</span>
                </div>
              </div>

              <div class="wear-tabs">
                <button
                  v-for="tab in wearTabs"
                  :key="tab.id"
                  class="wear-tab"
                  :class="{ active: activeWearTab === tab.id }"
                  @click="chooseWearTab(tab)"
                  v-if="!isStatTrak"
                >
                  <n-icon class="toggle-icon" v-if="tab.switch === true">
                    <Repeat />
                  </n-icon>
                  {{ tab.name }}
                </button>
              </div>

              <div class="item-tags">
                <n-tag type="success">热门关注 No.9</n-tag>
                <n-tag>更多</n-tag>
              </div>

              <div class="price-section">
                <div class="price-card">
                  <div class="price-label">今日</div>
                  <div class="price-value">
                    <span class="currency"
                      >¥{{ item.goods_info?.yyyp_sell_price }}</span
                    >
                    <span class="number">
                      <!-- {{
                      //item.price.toLocaleString()
                      }} -->
                    </span>
                  </div>
                  <div
                    class="price-change down"
                    v-if="item.goods_info?.yyyp_sell_price_rate_1 < 0"
                  >
                    <span
                      >↓ {{ item.goods_info?.yyyp_sell_price_1 }} （{{
                        item.goods_info?.yyyp_sell_price_rate_1
                      }}%）</span
                    >
                  </div>
                  <div
                    class="price-change up"
                    v-if="
                      item.goods_info?.yyyp_sell_price_rate_1 > 0 ||
                      item.goods_info?.yyyp_sell_price_rate_1 === 0
                    "
                  >
                    <span>
                      ↑{{ item.goods_info?.yyyp_sell_price_1 }} （{{
                        item.goods_info?.yyyp_sell_price_rate_1
                      }}%）</span
                    >
                  </div>
                </div>
                <div class="price-card">
                  <div class="price-label">本周价格波动</div>
                  <div class="price-value">
                    <span class="currency">¥</span>
                    <span class="number">{{
                      item.goods_info?.yyyp_sell_price_7
                    }}</span>
                  </div>
                  <div
                    class="price-change up"
                    v-if="item.goods_info?.yyyp_sell_price_rate_7 > 0"
                  >
                    <span
                      >↑ （{{
                        item.goods_info?.yyyp_sell_price_rate_7
                      }}%）</span
                    >
                  </div>
                  <div
                    class="price-change down"
                    v-if="
                      item.goods_info?.yyyp_sell_price_rate_7 < 0 ||
                      item.goods_info?.yyyp_sell_price_rate_7 === 0
                    "
                  >
                    <span
                      >↓ （{{
                        item.goods_info?.yyyp_sell_price_rate_7
                      }}%）</span
                    >
                  </div>
                </div>
              </div>

              <div class="market-platforms">
                <div class="platform-item">
                  <div class="platform-icon buff"></div>
                  <div class="platform-name">BUFF</div>
                  <div class="platform-price">
                    <div class="sell-price">
                      <span class="label">在售价:</span>
                      <span class="value"
                        >¥{{ item.goods_info.buff_sell_price }}</span
                      >
                    </div>
                    <div class="stock-info">
                      <span class="label">在售数:</span>
                      <span class="value"
                        >{{ item.goods_info.buff_sell_num }}件</span
                      >
                    </div>
                  </div>
                  <div class="platform-buy">
                    <div class="buy-price">
                      <span class="label">求购价:</span>
                      <span class="value"
                        >¥{{ item.goods_info.buff_buy_price }}</span
                      >
                    </div>
                    <div class="buy-info">
                      <span class="label">求购数:</span>
                      <span class="value"
                        >{{ item.goods_info.buff_buy_num }}件</span
                      >
                    </div>
                  </div>
                </div>

                <div class="platform-item">
                  <div class="platform-icon yy"></div>
                  <div class="platform-name">悠悠有品</div>
                  <div class="platform-price">
                    <div class="sell-price">
                      <span class="label">在售价:</span>
                      <span class="value"
                        >¥{{ item.goods_info.yyyp_sell_price }}</span
                      >
                    </div>
                    <div class="stock-info">
                      <span class="label">在售数:</span>
                      <span class="value"
                        >{{ item.goods_info.yyyp_sell_num }}件</span
                      >
                    </div>
                  </div>
                  <div class="platform-buy">
                    <div class="buy-price">
                      <span class="label">求购价:</span>
                      <span class="value"
                        >¥{{ item.goods_info.yyyp_buy_price }}</span
                      >
                    </div>
                    <div class="buy-info">
                      <span class="label">求购数:</span>
                      <span class="value"
                        >{{ item.goods_info?.yyyp_buy_num }}件</span
                      >
                    </div>
                  </div>
                </div>

                <div class="platform-item">
                  <div class="platform-icon steam"></div>
                  <div class="platform-name">Steam</div>
                  <div class="platform-price">
                    <div class="sell-price">
                      <span class="label">在售价:</span>
                      <span class="value"
                        >¥{{ item.goods_info.steam_sell_price }}</span
                      >
                    </div>
                    <div class="stock-info">
                      <span class="label">在售数:</span>
                      <span class="value"
                        >{{ item.goods_info.steam_sell_num }}件</span
                      >
                    </div>
                  </div>
                  <div class="platform-buy">
                    <div class="buy-price">
                      <span class="label">求购价:</span>
                      <span class="value"
                        >¥{{ item.goods_info.steam_buy_price }}</span
                      >
                    </div>
                    <div class="buy-info">
                      <span class="label">求购数:</span>
                      <span class="value"
                        >{{ item.goods_info.steam_buy_num }}件</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-section">
            <div class="chart-header">
              <div class="time-tabs">
                <n-button
                  v-for="tab in timeTabs"
                  :key="tab.value"
                  :type="activeTimeTab === tab.value ? 'primary' : 'default'"
                  @click="changeLineTime(tab)"
                  size="small"
                >
                  {{ tab.label }}
                </n-button>
              </div>
              <div class="chart-controls">
                <n-button text>悠悠有品</n-button>
                <n-button text>切换常规图</n-button>
                <n-button text>指标</n-button>
                <n-button text>
                  <n-icon><SettingsOutline /></n-icon>
                </n-button>
                <n-button text>
                  <n-icon><ExpandOutline /></n-icon>
                </n-button>
              </div>
            </div>
            <div ref="detailChartRef" class="detail-chart"></div>
          </div>
        </div>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick ,watch} from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  GameController,
  ArrowBack,
  NotificationsOutline,
  SettingsOutline,
  ExpandOutline,
} from "@vicons/ionicons5";
import * as echarts from "echarts";
import type { ECharts } from "echarts";
import { good, getOneChart } from "@/services/CSQaQ";
import dayjs from "dayjs";

const router = useRouter();
const route = useRoute();

const item = ref<any>(null);
const detailChartRef = ref<HTMLElement | null>(null);
let detailChartInstance: ECharts | null = null;
const isLoading = ref(false);

const wearTabs = ref([]);
const activeWearTab = ref();
const isStatTrak = ref(false);

const timeTabs = [
  { label: "近7天", value: "7" },
  { label: "近30天", value: "30" },
  { label: "近三个月", value: "90" },
  { label: "近半年", value: "180" },
  { label: "近一年", value: "365" },
  { label: "近三年", value: "1095" },
];
const activeTimeTab = ref("7");

const goBack = () => {
  router.back();
};

const initDetailChart = () => {
  if (!detailChartRef.value) {
    console.log("图表容器不存在");
    return;
  }
  if (!lineData.value) {
    console.log("图表数据不存在");
    return;
  }

  console.log("开始初始化图表，数据：", lineData.value);

  try {
    if (!detailChartInstance) {
      detailChartInstance = echarts.init(detailChartRef.value);
    }

    const prices = lineData.value.main_data || [];
    const volumes = lineData.value.num_data || [];
    const timestamps = lineData.value.timestamp || [];
    const formattedTimestamps = timestamps.map((item: any) =>
      dayjs(item).format("YYYY-MM-DD"),
    );
    const ma5Data = calculateMA(5, prices);
    const ma10Data = calculateMA(10, prices);
    const ma20Data = calculateMA(20, prices);
    const ma30Data = calculateMA(30, prices);

    console.log("处理后的价格数据：", prices);
    console.log("处理后的成交量数据：", volumes);

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(26, 26, 46, 0.98)",
        borderColor: "#2a2a4e",
        borderWidth: 1,
        textStyle: { color: "#fff" },
        padding: [10, 20],
        extraCssText:
          "box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); border-radius: 8px;",
        position: function (
          point: any,
          params: any,
          dom: any,
          rect: any,
          size: any,
        ) {
          return {
            left: 20,
            top: 20,
          };
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return "";

          const dataIndex = params[0].dataIndex;
          const date = formattedTimestamps[dataIndex];
          const price = prices[dataIndex];
          const volume = volumes[dataIndex];
          const ma5 = ma5Data[dataIndex];
          const ma10 = ma10Data[dataIndex];
          const ma20 = ma20Data[dataIndex];
          const ma30 = ma30Data[dataIndex];

          let change = "-";
          let changePercent = "-";
          if (dataIndex > 0 && prices[dataIndex - 1]) {
            const prevPrice = prices[dataIndex - 1];
            change = (price - prevPrice).toFixed(2);
            changePercent =
              (((price - prevPrice) / prevPrice) * 100).toFixed(2) + "%";
          }

          return `
            <div style="display: flex; gap: 24px; align-items: center; white-space: nowrap;">
              <span style="color: #888; font-size: 13px;">时间: <span style="color: #fff;">${date}</span></span>
              <span style="color: #888; font-size: 13px;">价格: <span style="color: #fff; font-weight: 600;">¥${price}</span></span>
              <span style="color: #888; font-size: 13px;">成交量: <span style="color: #fff;">${volume}</span></span>
              <span style="color: #f59e0b; font-size: 13px;">MA5: ${ma5 || "-"}</span>
              <span style="color: #10b981; font-size: 13px;">MA10: ${ma10 || "-"}</span>
              <span style="color: #8b5cf6; font-size: 13px;">MA20: ${ma20 || "-"}</span>
              <span style="color: #ec4899; font-size: 13px;">MA30: ${ma30 || "-"}</span>
              ${dataIndex > 0 ? `<span style="color: ${parseFloat(change) >= 0 ? "#10b981" : "#ef4444"}; font-size: 13px; font-weight: 500;">${parseFloat(change) >= 0 ? "+" : ""}${change} (${changePercent})</span>` : ""}
            </div>
          `;
        },
      },
      axisPointer: {
        type: "cross",
        link: { xAxisIndex: "all" },
        crossStyle: {
          color: "#667eea",
          width: 1,
          type: "dashed",
        },
        label: {
          backgroundColor: "#2a2a4e",
          color: "#fff",
          fontSize: 12,
          padding: [4, 8],
        },
      },
      legend: {
        data: ["MA5", "MA10", "MA20", "MA30"],
        textStyle: { color: "#888" },
        top: 10,
        right: 10,
      },
      grid: [
        {
          left: "3%",
          right: "4%",
          top: 60,
          height: "55%",
        },
        {
          left: "3%",
          right: "4%",
          top: "72%",
          height: "16%",
        },
      ],
      xAxis: [
        {
          type: "category",
          data: formattedTimestamps,
          axisLine: { lineStyle: { color: "#2a2a4e" } },
          axisLabel: { color: "#888" },
          boundaryGap: false,
        },
        {
          type: "category",
          gridIndex: 1,
          data: formattedTimestamps,
          axisLine: { lineStyle: { color: "#2a2a4e" } },
          axisLabel: { color: "#888" },
          boundaryGap: false,
        },
      ],
      yAxis: [
        {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: "#2a2a4e" } },
          axisLabel: { color: "#888" },
        },
        {
          type: "value",
          gridIndex: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: "#2a2a4e" } },
          axisLabel: { color: "#888" },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: "价格",
          type: "line",
          data: prices,
          smooth: true,
          lineStyle: { color: "#667eea" },
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
                { offset: 1, color: "rgba(102, 126, 234, 0.05)" },
              ],
            },
          },
        },
        {
          name: "MA5",
          type: "line",
          data: ma5Data,
          smooth: true,
          lineStyle: { color: "#f59e0b" },
          showSymbol: false,
        },
        {
          name: "MA10",
          type: "line",
          data: ma10Data,
          smooth: true,
          lineStyle: { color: "#10b981" },
          showSymbol: false,
        },
        {
          name: "MA20",
          type: "line",
          data: ma20Data,
          smooth: true,
          lineStyle: { color: "#8b5cf6" },
          showSymbol: false,
        },
        {
          name: "MA30",
          type: "line",
          data: ma30Data,
          smooth: true,
          lineStyle: { color: "#ec4899" },
          showSymbol: false,
        },
        {
          name: "成交量",
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumes,
          itemStyle: {
            color: (params: any) => {
              const idx = params.dataIndex;
              return idx > 0 && prices[idx] >= prices[idx - 1]
                ? "#10b981"
                : "#ef4444";
            },
          },
        },
      ],
    };

    detailChartInstance.setOption(option, true);
    console.log("图表初始化完成");
  } catch (error) {
    console.error("图表初始化错误：", error);
  }
};

const calculateMA = (dayCount: number, data: any[]) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < dayCount - 1) {
      result.push("-");
      continue;
    }
    let sum = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += parseFloat(data[i - j]);
    }
    result.push((sum / dayCount).toFixed(2));
  }
  return result;
};
const chooseWearTab = (tab) => {
  isLoading.value = true;
  activeWearTab.value = tab.id;
  currentId.value = tab.id;
  let queryParams = {
    id: tab.id,
  };
  //wearTabs.value = [];
  good(queryParams)
    .then((res) => {
      console.log(res);
      item.value = res.data;
      activeWearTab.value = res.data.goods_info.id;
      console.log(wearTabs.value);
      wearTabs.value = res.data.button_list;
      getIdObjectKline(currentId.value);
    })
    .catch((err) => {})
    .finally(() => {
      isLoading.value = false;
    });
};
const lineData = ref();
const currentId = ref();
const getIdObjectKline = (id) => {
  console.log("开始获取图表数据，ID：", id);
  let data = {
    good_id: id,
    key: "sell_price",
    platform: 2,
    period: activeTimeTab.value,
    style: "all_style",
  };
  getOneChart(data)
    .then((res) => {
      console.log("获取图表数据成功：", res);
      lineData.value = res.data;
    })
    .catch((err) => {
      console.error("获取图表数据失败：", err);
    });
};

watch(
  lineData,
  (newData) => {
    if (newData) {
      console.log("lineData 数据变化，准备更新图表");
      nextTick(() => {
        initDetailChart();
      });
    }
  },
  { deep: true },
);

onMounted(() => {
  isLoading.value = true;
  let queryParams = {
    id: route.query.id,
  };
  currentId.value = route.query.id;
  good(queryParams)
    .then((res) => {
      console.log(res);
      item.value = res.data;
      activeWearTab.value = res.data.goods_info.id;
      wearTabs.value = res.data.button_list;
      console.log(wearTabs.value);
      getIdObjectKline(currentId.value);
    })
    .catch((err) => {})
    .finally(() => {
      isLoading.value = false;
    });
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (detailChartInstance) {
    detailChartInstance.dispose();
  }
  window.removeEventListener("resize", handleResize);
});

const handleResize = () => {
  if (detailChartInstance) {
    detailChartInstance.resize();
  }
};
const changeLineTime = (tab) => {
  activeTimeTab.value = tab.value;
  getIdObjectKline(currentId.value);
};
</script>

<style scoped>
.item-detail-page {
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
}

.header {
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #2a2a4e;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  margin-right: 16px;
}

.content {
  padding: 24px;
}

.detail-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 13, 26, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #2a2a4e;
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
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}

.detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-header {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 32px;
  background: #1a1a2e;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #2a2a4e;
}

.item-image-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2a2a4e 0%, #1a1a2e 100%);
  border-radius: 12px;
  padding: 32px;
  min-height: 300px;
}

.item-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  z-index: 10;

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

.item-main-image {
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
}

.item-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wear-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.wear-tab {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #3a3a5e;
  border-radius: 8px;
  color: #888;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4a4a6e;
    color: #aaa;
  }

  &.active {
    border-color: #f59e0b;
    color: #f59e0b;
  }
}

.wear-tabs-divider {
  width: 1px;
  background: #3a3a5e;
  margin: 0 8px;
}

.wear-tab-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #3a3a5e;
  border-radius: 8px;
  color: #888;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4a4a6e;
    color: #aaa;
  }

  &.active {
    border-color: #667eea;
    color: #667eea;
  }
}

.toggle-icon {
  font-size: 1.1rem;
  /* color: red; */
}

.item-title-row {
  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
  }
}

.item-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .meta-label {
    font-size: 0.875rem;
    color: #888;
  }

  .meta-value {
    font-size: 1rem;
    color: #fff;
    font-weight: 500;
  }
}

.item-tags {
  display: flex;
  gap: 8px;
}

.price-section {
  display: flex;
  gap: 16px;
}

.price-card {
  flex: 1;
  background: linear-gradient(135deg, #2a2a4e 0%, #1a1a2e 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #3a3a5e;
}

.price-label {
  font-size: 0.875rem;
  color: #888;
}

.price-value {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .currency {
    font-size: 1.125rem;
    color: #f59e0b;
    font-weight: 600;
  }

  .number {
    font-size: 1.75rem;
    font-weight: 700;
    color: #f59e0b;
  }
}

.price-change {
  font-size: 0.875rem;
  font-weight: 500;

  &.up {
    color: #10b981;
  }

  &.down {
    color: #ef4444;
  }
}

.market-platforms {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-item {
  display: grid;
  grid-template-columns: auto auto 1fr 1fr;
  gap: 16px;
  align-items: center;
  background: #2a2a4e;
  border-radius: 8px;
  padding: 12px 16px;
}

.platform-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;

  &.buff {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  &.yy {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  &.steam {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  &.r8game {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  }
}

.platform-name {
  color: #fff;
  font-weight: 500;
  min-width: 80px;
}

.platform-price,
.platform-buy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sell-price,
.buy-price,
.stock-info,
.buy-info {
  display: flex;
  gap: 4px;
  font-size: 0.875rem;

  .label {
    color: #888;
  }

  .value {
    color: #fff;
    font-weight: 500;
  }
}

.chart-section {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #2a2a4e;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.time-tabs,
.chart-controls {
  display: flex;
  gap: 8px;
}

.detail-chart {
  width: 100%;
  height: 500px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-section {
  animation: fadeIn 0.6s ease-out forwards;
}
</style>
