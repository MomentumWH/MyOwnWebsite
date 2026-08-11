<script setup lang="ts">
import { computed } from "vue";
import {
  AlertCircleOutline,
  AnalyticsOutline,
  BulbOutline,
  ShieldCheckmarkOutline,
  TrendingDownOutline,
  TrendingUpOutline,
} from "@vicons/ionicons5";
import type { ItemTrendInsight } from "@/composables/csgo/useItemTrendInsight";

const props = defineProps<{
  insight: ItemTrendInsight;
}>();

const stanceIcon = computed(() => {
  if (props.insight.stanceTone === "positive") {
    return TrendingUpOutline;
  }

  if (props.insight.stanceTone === "negative") {
    return TrendingDownOutline;
  }

  return AnalyticsOutline;
});

const recommendationIcon = computed(() => {
  if (props.insight.recommendationTone === "positive") {
    return BulbOutline;
  }

  if (props.insight.recommendationTone === "negative") {
    return AlertCircleOutline;
  }

  return ShieldCheckmarkOutline;
});
</script>

<template>
  <section class="item-trend-insight" aria-labelledby="item-trend-insight-title">
    <div class="insight-topline">
      <div>
        <span class="insight-kicker">Single item intelligence / K-line reading</span>
        <h2 id="item-trend-insight-title">{{ insight.title }}</h2>
      </div>
      <div class="insight-status" :class="`tone-${insight.stanceTone}`">
        <n-icon size="18"><component :is="stanceIcon" /></n-icon>
        <span>{{ insight.stance }}</span>
      </div>
    </div>

    <div class="insight-context">
      <span>{{ insight.window }}</span>
      <span>{{ insight.dataPoints }} 个有效价格点</span>
      <span>基于当前平台价格曲线</span>
    </div>

    <p class="insight-description">{{ insight.description }}</p>

    <div class="insight-metrics">
      <article v-for="metric in insight.metrics" :key="metric.label" class="insight-metric">
        <span>{{ metric.label }}</span>
        <strong :class="`tone-${metric.tone}`">{{ metric.value }}</strong>
        <small>{{ metric.detail }}</small>
      </article>
    </div>

    <div class="recommendation" :class="`tone-${insight.recommendationTone}`">
      <div class="recommendation-icon">
        <n-icon size="22"><component :is="recommendationIcon" /></n-icon>
      </div>
      <div>
        <strong>{{ insight.recommendationTitle }}</strong>
        <p>{{ insight.recommendation }}</p>
      </div>
    </div>

    <p class="insight-disclaimer">
      分析仅基于当前 K 线窗口和页面已加载数据，不构成投资承诺；实际决策还应核对平台价差、库存、成交深度与个人预算。
    </p>
  </section>
</template>

<style scoped>
.item-trend-insight {
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  padding: 26px 28px 22px;
  border: 1px solid rgba(102, 126, 234, 0.38);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(23, 28, 52, 0.98), rgba(15, 20, 35, 0.96)),
    radial-gradient(circle at 88% 0%, rgba(91, 232, 204, 0.12), transparent 36%);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.item-trend-insight::before {
  position: absolute;
  top: 0;
  right: 10%;
  left: 10%;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(91, 232, 204, 0.8), transparent);
  box-shadow: 0 0 18px rgba(91, 232, 204, 0.5);
}

.insight-topline,
.insight-context,
.insight-status,
.recommendation {
  display: flex;
  align-items: center;
}

.insight-topline {
  justify-content: space-between;
  gap: 20px;
}

.insight-kicker {
  color: #5be8cc;
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h2 {
  margin: 8px 0 0;
  color: #fff;
  font-size: clamp(1.1rem, 1.7vw, 1.45rem);
  line-height: 1.3;
}

.insight-status {
  gap: 7px;
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid currentColor;
  border-radius: 999px;
  font-family: "Fira Code", monospace;
  font-size: 0.74rem;
}

.tone-positive { color: #55d6b0; }
.tone-negative { color: #ff7767; }
.tone-warning { color: #f5b74f; }
.tone-neutral { color: #b6bfd5; }

.insight-context {
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-top: 16px;
  padding: 11px 0;
  color: rgba(255, 255, 255, 0.42);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
}

.insight-description {
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.88rem;
  line-height: 1.9;
}

.insight-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.08);
}

.insight-metric {
  display: grid;
  gap: 7px;
  min-height: 88px;
  padding: 14px 15px;
  background: rgba(8, 13, 26, 0.72);
}

.insight-metric > span,
.insight-metric small {
  color: rgba(255, 255, 255, 0.44);
  font-size: 0.7rem;
}

.insight-metric strong {
  font-family: "Fira Code", monospace;
  font-size: 1.05rem;
}

.recommendation {
  gap: 14px;
  align-items: flex-start;
  margin-top: 20px;
  padding: 16px 18px;
  border-left: 3px solid currentColor;
  background: rgba(255, 255, 255, 0.035);
}

.recommendation-icon {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 10px;
}

.recommendation strong {
  color: currentColor;
  font-size: 0.92rem;
}

.recommendation p {
  margin: 7px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.82rem;
  line-height: 1.8;
}

.insight-disclaimer {
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.32);
  font-size: 0.68rem;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .insight-topline { align-items: flex-start; flex-direction: column; }
  .insight-status { align-self: flex-start; }
  .insight-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .item-trend-insight { padding: 20px 16px 18px; }
  .insight-metrics { grid-template-columns: 1fr; }
  .insight-description { font-size: 0.82rem; line-height: 1.8; }
}
</style>
