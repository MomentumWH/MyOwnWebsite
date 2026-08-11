<script setup lang="ts">
import { computed } from "vue";
import { use, type EChartsCoreOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, PieChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import VChart from "vue-echarts";
import type {
  InsightDistributionItem,
  InsightTrendSeries,
} from "@/composables/csgo/useMarketInsight";

const props = defineProps<{
  distribution: InsightDistributionItem[];
  trends: InsightTrendSeries[];
}>();

use([
  CanvasRenderer,
  GridComponent,
  LineChart,
  PieChart,
  TooltipComponent,
]);

const formatChange = (value: number | null) => {
  if (value === null) {
    return "--";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const pieOption = computed<EChartsCoreOption>(() => ({
  animationDuration: 620,
  animationEasing: "cubicOut",
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(9, 13, 24, 0.96)",
    borderColor: "rgba(255, 255, 255, 0.14)",
    textStyle: { color: "#f7f8fc" },
    formatter: "{b}<br/>{c} 个 · {d}%",
  },
  series: [
    {
      type: "pie",
      radius: ["54%", "76%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: "#111522",
        borderWidth: 3,
      },
      label: { show: false },
      emphasis: {
        scaleSize: 8,
        itemStyle: {
          shadowBlur: 18,
          shadowColor: "rgba(0, 0, 0, 0.35)",
        },
      },
      data: props.distribution.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color },
      })),
    },
  ],
}));

const distributionTotal = computed(() => props.distribution.reduce(
  (total, item) => total + item.value,
  0,
));

const trendCharts = computed(() => props.trends.map((trend) => ({
  ...trend,
  changeLabel: formatChange(trend.change),
  toneClass: trend.change === null || trend.change === 0
    ? ""
    : trend.change > 0
      ? "positive"
      : "negative",
  option: {
    animationDuration: 560,
    animationEasing: "cubicOut",
    grid: { top: 20, right: 12, bottom: 28, left: 48 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(9, 13, 24, 0.96)",
      borderColor: "rgba(255, 255, 255, 0.14)",
      textStyle: { color: "#f7f8fc" },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trend.points.map((point) => point.label),
      axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.1)" } },
      axisTick: { show: false },
      axisLabel: {
        color: "rgba(255, 255, 255, 0.34)",
        fontSize: 10,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      splitNumber: 3,
      axisLabel: {
        color: "rgba(255, 255, 255, 0.34)",
        fontSize: 10,
      },
      splitLine: {
        lineStyle: { color: "rgba(255, 255, 255, 0.06)" },
      },
    },
    series: [
      {
        name: trend.name,
        type: "line",
        data: trend.points.map((point) => point.value),
        showSymbol: false,
        smooth: 0.32,
        lineStyle: { width: 2, color: trend.color },
        itemStyle: { color: trend.color },
        areaStyle: { color: `${trend.color}24` },
      },
    ],
  } satisfies EChartsCoreOption,
})));
</script>

<template>
  <section class="insight-visuals" aria-labelledby="insight-visuals-title">
    <div class="visuals-heading">
      <div>
        <span class="visuals-kicker">Distribution / momentum</span>
        <h4 id="insight-visuals-title">市场结构与趋势</h4>
      </div>
      <span class="visuals-caption">最近有效数据窗口</span>
    </div>

    <div class="visuals-grid">
      <div class="distribution-view">
        <div class="chart-title-row">
          <span>涨跌结构</span>
          <strong>{{ distributionTotal }} 样本</strong>
        </div>
        <div v-if="distribution.length" class="distribution-layout">
          <VChart
            :option="pieOption"
            autoresize
            class="pie-chart"
            role="img"
            aria-label="市场上涨、持平和下跌样本占比饼图"
          />
          <div class="distribution-legend">
            <div v-for="item in distribution" :key="item.name" class="legend-row">
              <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
              <span>{{ item.name }}</span>
              <strong>{{ item.percent.toFixed(1) }}%</strong>
              <small>{{ item.value }} 个</small>
            </div>
          </div>
        </div>
        <div v-else class="chart-empty">等待涨跌分布数据</div>
      </div>

      <div class="trend-view">
        <div
          v-for="trend in trendCharts"
          :key="trend.name"
          class="trend-chart-block"
        >
          <div class="chart-title-row">
            <span>{{ trend.name }}</span>
            <strong :class="trend.toneClass">
              {{ trend.changeLabel }}
            </strong>
          </div>
          <VChart
            v-if="trend.points.length > 1"
            :option="trend.option"
            autoresize
            class="trend-chart"
            role="img"
            :aria-label="`${trend.name}折线趋势图，窗口变化${trend.changeLabel}`"
          />
          <div v-else class="chart-empty">等待趋势序列数据</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.insight-visuals {
  margin-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.visuals-heading,
.chart-title-row,
.legend-row {
  display: flex;
  align-items: center;
}

.visuals-heading {
  justify-content: space-between;
  padding: 18px 0 14px;
}

.visuals-kicker,
.visuals-caption {
  color: rgba(255, 255, 255, 0.38);
  font-family: "Fira Code", monospace;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.visuals-heading h4 {
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.98rem;
  letter-spacing: 0;
}

.visuals-grid {
  display: grid;
  grid-template-columns: minmax(340px, 0.72fr) minmax(0, 1.6fr);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.distribution-view,
.trend-view {
  min-width: 0;
  padding: 18px 0;
}

.distribution-view {
  padding-right: 22px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.trend-view {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  padding-left: 22px;
}

.trend-chart-block + .trend-chart-block {
  padding-left: 20px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.trend-chart-block:first-child {
  padding-right: 20px;
}

.chart-title-row {
  justify-content: space-between;
  min-height: 24px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.72rem;
}

.chart-title-row strong {
  color: rgba(255, 255, 255, 0.74);
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
}

.chart-title-row strong.positive { color: #55d6b0; }
.chart-title-row strong.negative { color: #ff7767; }

.distribution-layout {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  align-items: center;
  min-height: 186px;
}

.pie-chart {
  width: 170px;
  height: 170px;
}

.distribution-legend {
  display: grid;
  gap: 11px;
}

.legend-row {
  display: grid;
  grid-template-columns: 8px 36px 54px 1fr;
  gap: 8px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.72rem;
}

.legend-dot {
  width: 7px;
  height: 7px;
  box-shadow: 0 0 8px currentColor;
}

.legend-row strong {
  color: rgba(255, 255, 255, 0.88);
  font-family: "Fira Code", monospace;
}

.legend-row small {
  color: rgba(255, 255, 255, 0.34);
  font-size: 0.68rem;
}

.trend-chart {
  width: 100%;
  height: 186px;
}

.chart-empty {
  display: grid;
  min-height: 170px;
  place-items: center;
  color: rgba(255, 255, 255, 0.28);
  font-size: 0.72rem;
}

@media (max-width: 1100px) {
  .visuals-grid { grid-template-columns: 1fr; }
  .distribution-view { padding-right: 0; border-right: 0; }
  .trend-view { padding-left: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); }
}

@media (max-width: 700px) {
  .visuals-heading { align-items: flex-start; flex-direction: column; gap: 8px; }
  .trend-view { grid-template-columns: 1fr; }
  .trend-chart-block:first-child { padding-right: 0; }
  .trend-chart-block + .trend-chart-block { margin-top: 14px; padding-top: 14px; padding-left: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); border-left: 0; }
  .distribution-layout { grid-template-columns: 150px minmax(0, 1fr); }
  .pie-chart { width: 150px; height: 150px; }
}
</style>
