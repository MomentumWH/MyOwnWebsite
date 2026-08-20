<script setup lang="ts">
import { computed } from "vue";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { use, type EChartsCoreOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import type { SeasonTrendPoint } from "../arsenalSeason";

const props = defineProps<{
  trend: readonly SeasonTrendPoint[];
}>();

const hasProjection = computed(() => props.trend.some((point) => point.projected !== null));
const matchweekRange = computed(() => props.trend.length > 0
  ? `MW 01-${String(props.trend.length).padStart(2, "0")}`
  : "MW --");

use([
  CanvasRenderer,
  GridComponent,
  LineChart,
  TooltipComponent,
]);

const chartOption = computed<EChartsCoreOption>(() => ({
  animationDuration: 760,
  animationEasing: "cubicOut",
  grid: { top: 28, right: 18, bottom: 42, left: 42 },
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(18, 20, 24, 0.96)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    textStyle: { color: "#ffffff" },
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: props.trend.map((point) => `${point.label} · ${point.opponent}`),
    axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.14)" } },
    axisTick: { show: false },
    axisLabel: {
      color: "rgba(255, 255, 255, 0.48)",
      fontSize: 10,
      hideOverlap: true,
    },
  },
  yAxis: {
    type: "value",
    min: 0,
    splitNumber: 4,
    axisLabel: {
      color: "rgba(255, 255, 255, 0.42)",
      fontSize: 10,
    },
    splitLine: {
      lineStyle: {
        color: "rgba(255, 255, 255, 0.075)",
        type: "dashed",
      },
    },
  },
  series: [
    {
      name: "实际积分",
      type: "line",
      data: props.trend.map((point) => point.actual),
      connectNulls: false,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { color: "#ffffff", width: 3 },
      itemStyle: { color: "#ffffff", borderColor: "#e30613", borderWidth: 3 },
    },
    {
      name: "模型预测",
      type: "line",
      data: props.trend.map((point) => point.projected),
      symbol: "none",
      smooth: 0.28,
      lineStyle: { color: "#e8ff64", type: "dashed", width: 2 },
      areaStyle: {
        color: "rgba(232, 255, 100, 0.09)",
      },
    },
  ],
}));
</script>

<template>
  <section class="momentum-panel" aria-labelledby="momentum-title">
    <header class="panel-heading">
      <div>
        <span class="panel-kicker">Points trajectory / {{ matchweekRange }}</span>
        <h2 id="momentum-title">积分走势</h2>
      </div>
      <div class="chart-legend" aria-label="图例">
        <span><i class="legend-dot legend-dot--actual"></i>实际</span>
        <span v-if="hasProjection"><i class="legend-dot legend-dot--forecast"></i>预测</span>
      </div>
    </header>

    <VChart
      class="momentum-chart"
      :option="chartOption"
      autoresize
      role="img"
      :aria-label="hasProjection ? '阿森纳本赛季实际积分和模型预测积分走势折线图' : '阿森纳本赛季实际积分走势折线图'"
    />

    <footer class="chart-note">
      <span>已完赛场次按官方赛果累计积分</span>
      <span>{{ hasProjection ? "虚线为预测区间" : "预测数据尚未接入" }}</span>
    </footer>
  </section>
</template>

<style scoped>
.momentum-panel {
  min-width: 0;
  padding: 28px 30px 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.025);
}

.panel-heading,
.chart-legend,
.chart-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-kicker {
  color: rgba(255, 255, 255, 0.43);
  font-family: "Fira Code", monospace;
  font-size: 0.67rem;
  text-transform: uppercase;
}

.panel-heading h2 {
  margin: 6px 0 0;
  color: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0;
}

.chart-legend {
  gap: 18px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.72rem;
}

.chart-legend span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.legend-dot {
  width: 18px;
  height: 2px;
}

.legend-dot--actual {
  background: #ffffff;
}

.legend-dot--forecast {
  background: repeating-linear-gradient(90deg, #e8ff64 0 5px, transparent 5px 8px);
}

.momentum-chart {
  width: 100%;
  height: 330px;
  margin-top: 12px;
}

.chart-note {
  gap: 1rem;
  padding-top: 14px;
  color: rgba(255, 255, 255, 0.36);
  font-size: 0.68rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 680px) {
  .momentum-panel {
    padding: 22px 16px 16px;
  }

  .panel-heading,
  .chart-note {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .momentum-chart {
    height: 280px;
  }
}
</style>
