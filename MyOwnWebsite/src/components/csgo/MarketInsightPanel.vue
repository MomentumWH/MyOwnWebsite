<script setup lang="ts">
import { CopyOutline, DownloadOutline } from "@vicons/ionicons5";
import { useMessage } from "naive-ui";
import type { MarketInsightReport } from "@/composables/csgo/useMarketInsight";

const props = defineProps<{
  report: MarketInsightReport;
}>();

const message = useMessage();

const copyWithSelection = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Copy command was rejected");
  }
};

const copyReport = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(props.report.copyText);
    } else {
      copyWithSelection(props.report.copyText);
    }
    message.success("分析摘要已复制");
  } catch {
    try {
      copyWithSelection(props.report.copyText);
      message.success("分析摘要已复制");
    } catch {
      message.warning("当前浏览器不允许直接复制，请手动选择报告内容");
    }
  }
};

const downloadReport = () => {
  const blob = new Blob([props.report.copyText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cs-market-report-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  message.success("分析报告已下载");
};
</script>

<template>
  <section class="market-insight-panel fade-in-section" aria-labelledby="market-insight-title">
    <div class="insight-header">
      <div>
        <p class="insight-kicker">Market intelligence / snapshot report</p>
        <h3 id="market-insight-title">{{ report.headline }}</h3>
        <p class="insight-summary">{{ report.summary }}</p>
      </div>
      <div class="insight-actions">
        <button type="button" class="insight-action" title="复制分析摘要" @click="copyReport">
          <n-icon><CopyOutline /></n-icon>
          <span>复制</span>
        </button>
        <button type="button" class="insight-action" title="下载文本报告" @click="downloadReport">
          <n-icon><DownloadOutline /></n-icon>
          <span>下载</span>
        </button>
      </div>
    </div>

    <div class="insight-meta-row">
      <span class="stance-chip" :class="`tone-${report.stanceTone}`">
        <i></i>{{ report.stance }}
      </span>
      <span>置信度 {{ report.confidence }}</span>
      <span>覆盖度 {{ report.coverage }}%</span>
      <span>{{ report.period }}</span>
    </div>

    <div class="insight-metrics">
      <article v-for="metric in report.metrics" :key="metric.label" class="insight-metric">
        <span class="metric-label">{{ metric.label }}</span>
        <strong :class="`tone-${metric.tone}`">{{ metric.value }}</strong>
        <span class="metric-detail">{{ metric.detail }}</span>
      </article>
    </div>

    <div class="insight-body">
      <div class="signal-list">
        <div v-for="signal in report.signals" :key="signal.label" class="signal-row">
          <span class="signal-index">{{ signal.label }}</span>
          <div class="signal-copy">
            <div class="signal-title-row">
              <strong>{{ signal.title }}</strong>
              <span class="signal-dot" :class="`tone-${signal.tone}`"></span>
            </div>
            <p>{{ signal.description }}</p>
          </div>
        </div>
      </div>

      <aside class="coverage-panel" aria-label="分析数据来源">
        <div class="coverage-heading">
          <span>DATA COVERAGE</span>
          <strong>{{ report.coverage }}%</strong>
        </div>
        <div class="coverage-track">
          <span :style="{ width: `${report.coverage}%` }"></span>
        </div>
        <p>本次报告使用当前页面已加载的数据，不代表投资建议。</p>
        <div class="source-list">
          <span v-for="source in report.sources" :key="source">{{ source }}</span>
          <span v-if="!report.sources.length">等待接口数据</span>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped lang="scss">
.market-insight-panel {
  position: relative;
  overflow: hidden;
  margin: 28px 0 34px;
  padding: 26px 28px 24px;
  border: 1px solid rgba(245, 158, 11, 0.26);
  background:
    linear-gradient(135deg, rgba(24, 22, 43, 0.96), rgba(18, 22, 34, 0.94)),
    radial-gradient(circle at 88% 0%, rgba(245, 158, 11, 0.15), transparent 34%);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.market-insight-panel::after {
  position: absolute;
  top: 0;
  right: 12%;
  width: 28%;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  box-shadow: 0 0 18px rgba(245, 158, 11, 0.65);
}

.insight-header,
.insight-meta-row,
.insight-body,
.signal-title-row,
.coverage-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.insight-kicker {
  margin: 0 0 8px;
  color: #f59e0b;
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  color: #fff;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
  letter-spacing: 0.02em;
}

.insight-summary {
  max-width: 760px;
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.63);
  font-size: 0.9rem;
  line-height: 1.7;
}

.insight-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 18px;
}

.insight-action {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 36px;
  padding: 0 11px;
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, transform 180ms ease, background 180ms ease;
}

.insight-action:hover {
  color: #fff;
  border-color: rgba(245, 158, 11, 0.46);
  background: rgba(245, 158, 11, 0.11);
  transform: translateY(-1px);
}

.insight-meta-row {
  justify-content: flex-start;
  gap: 16px;
  margin-top: 20px;
  padding: 12px 0;
  color: rgba(255, 255, 255, 0.46);
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.stance-chip {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  color: #fff;
  font-family: inherit;
}

.stance-chip i,
.signal-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.tone-positive { color: #55d6b0; }
.tone-negative { color: #ff7767; }
.tone-neutral { color: #b6bfd5; }
.tone-warning { color: #f5b74f; }

.stance-chip.tone-positive i,
.signal-dot.tone-positive { background: #55d6b0; box-shadow: 0 0 10px rgba(85, 214, 176, 0.75); }
.stance-chip.tone-negative i,
.signal-dot.tone-negative { background: #ff7767; box-shadow: 0 0 10px rgba(255, 119, 103, 0.7); }
.stance-chip.tone-neutral i,
.signal-dot.tone-neutral { background: #b6bfd5; }
.stance-chip.tone-warning i,
.signal-dot.tone-warning { background: #f5b74f; box-shadow: 0 0 10px rgba(245, 183, 79, 0.65); }

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
  min-height: 94px;
  padding: 15px 16px;
  background: rgba(10, 14, 25, 0.75);
}

.metric-label,
.metric-detail {
  color: rgba(255, 255, 255, 0.46);
  font-size: 0.72rem;
}

.insight-metric strong {
  font-family: "Fira Code", monospace;
  font-size: 1.25rem;
}

.insight-body {
  align-items: stretch;
  gap: 24px;
  margin-top: 20px;
}

.signal-list {
  flex: 1;
  min-width: 0;
}

.signal-row {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.signal-row:last-child { border-bottom: 0; }

.signal-index {
  color: #f59e0b;
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
}

.signal-copy { flex: 1; min-width: 0; }
.signal-title-row { justify-content: flex-start; gap: 10px; }
.signal-title-row strong { color: rgba(255, 255, 255, 0.9); font-size: 0.92rem; }
.signal-copy p { margin: 6px 0 0; color: rgba(255, 255, 255, 0.55); font-size: 0.8rem; line-height: 1.65; }

.coverage-panel {
  flex: 0 0 250px;
  align-self: stretch;
  padding: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.coverage-heading span { color: rgba(255, 255, 255, 0.45); font-family: "Fira Code", monospace; font-size: 0.68rem; letter-spacing: 0.12em; }
.coverage-heading strong { color: #f59e0b; font-family: "Fira Code", monospace; font-size: 1.15rem; }
.coverage-track { height: 5px; margin-top: 14px; overflow: hidden; background: rgba(255, 255, 255, 0.1); }
.coverage-track span { display: block; height: 100%; background: linear-gradient(90deg, #667eea, #55d6b0, #f59e0b); transition: width 320ms ease; }
.coverage-panel p { margin: 14px 0 12px; color: rgba(255, 255, 255, 0.43); font-size: 0.72rem; line-height: 1.6; }
.source-list { display: flex; flex-wrap: wrap; gap: 6px; }
.source-list span { padding: 4px 7px; color: rgba(255, 255, 255, 0.58); border: 1px solid rgba(255, 255, 255, 0.11); font-size: 0.66rem; }

@media (max-width: 900px) {
  .insight-header { align-items: flex-start; flex-direction: column; gap: 14px; }
  .insight-actions { margin-left: 0; }
  .insight-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .insight-body { flex-direction: column; }
  .coverage-panel { flex-basis: auto; border-top: 1px solid rgba(255, 255, 255, 0.08); border-left: 0; }
}

@media (max-width: 560px) {
  .market-insight-panel { margin: 20px 0 26px; padding: 20px 16px; }
  .insight-meta-row { flex-wrap: wrap; gap: 8px 14px; }
  .insight-metrics { grid-template-columns: 1fr; }
  .insight-metric { min-height: 0; }
}
</style>
