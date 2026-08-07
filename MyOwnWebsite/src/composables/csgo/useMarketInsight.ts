import { computed, toValue, type MaybeRefOrGetter } from "vue";

export type InsightTone = "positive" | "negative" | "neutral" | "warning";

export interface InsightMetric {
  label: string;
  value: string;
  detail: string;
  tone: InsightTone;
}

export interface InsightSignal {
  label: string;
  title: string;
  description: string;
  tone: InsightTone;
}

export interface MarketInsightReport {
  headline: string;
  summary: string;
  stance: string;
  stanceTone: InsightTone;
  confidence: string;
  period: string;
  metrics: InsightMetric[];
  signals: InsightSignal[];
  sources: string[];
  coverage: number;
  generatedAt: string;
  copyText: string;
}

export interface MarketInsightSources {
  currentTab: MaybeRefOrGetter<unknown>;
  onlineData: MaybeRefOrGetter<unknown>;
  riseFallData: MaybeRefOrGetter<unknown>;
  heatLineData: MaybeRefOrGetter<unknown>;
  kLineData: MaybeRefOrGetter<unknown>;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[%,$¥\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const readNumber = (record: UnknownRecord, ...keys: string[]) => {
  for (const key of keys) {
    const value = toNumber(record[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
};

const formatNumber = (value: number | null, fractionDigits = 2) => {
  if (value === null) {
    return "--";
  }

  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
};

const formatSignedPercent = (value: number | null) => {
  if (value === null) {
    return "--";
  }

  return `${value >= 0 ? "+" : ""}${formatNumber(value)}%`;
};

const toneForChange = (value: number | null): InsightTone => {
  if (value === null || value === 0) {
    return "neutral";
  }

  return value > 0 ? "positive" : "negative";
};

const safeRate = (current: number | null, base: number | null) => {
  if (current === null || base === null || base === 0) {
    return null;
  }

  return ((current - base) / Math.abs(base)) * 100;
};

const toSeries = (value: unknown): UnknownRecord[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Array.isArray(item)
      ? { value: item[1], time: item[0] }
      : asRecord(item))
    .filter((item) => toNumber(item.value ?? item.c ?? item.close ?? item.m) !== null);
};

const calculateSeriesRate = (value: unknown, keys: string[]) => {
  const series = toSeries(value)
    .map((item) => readNumber(item, ...keys, "value"))
    .filter((item): item is number => item !== null);

  if (series.length < 2) {
    return null;
  }

  return safeRate(series.at(-1) ?? null, series[0] ?? null);
};

export function useMarketInsight(sources: MarketInsightSources) {
  const report = computed<MarketInsightReport>(() => {
    const current = asRecord(toValue(sources.currentTab));
    const online = asRecord(toValue(sources.onlineData));
    const breadth = asRecord(toValue(sources.riseFallData));
    const indexChange = readNumber(current, "chg_rate", "change_rate", "percent");
    const marketIndex = readNumber(current, "market_index", "index", "value");
    const onlineCurrent = readNumber(online, "current_number", "current", "value");
    const onlinePrevious = readNumber(online, "same_time_number", "yesterday", "previous");
    const onlineRate = readNumber(online, "rate", "change_rate", "percent")
      ?? safeRate(onlineCurrent, onlinePrevious);
    const rise = readNumber(breadth, "rise", "up", "上涨") ?? 0;
    const flat = readNumber(breadth, "flat", "unchanged", "持平") ?? 0;
    const fall = readNumber(breadth, "fall", "down", "下跌") ?? 0;
    const breadthSource = typeof breadth.sourceLabel === "string"
      ? breadth.sourceLabel
      : "涨跌分布";
    const breadthTotal = rise + flat + fall;
    const riseShare = breadthTotal > 0 ? (rise / breadthTotal) * 100 : null;
    const fallShare = breadthTotal > 0 ? (fall / breadthTotal) * 100 : null;
    const breadthBias = breadthTotal > 0 ? ((rise - fall) / breadthTotal) * 100 : null;
    const klineRate = calculateSeriesRate(toValue(sources.kLineData), ["c", "close"]);
    const heatRate = calculateSeriesRate(toValue(sources.heatLineData), ["value", "m"]);
    const sourceCount = [
      current.market_index ?? current.index,
      onlineCurrent,
      breadthTotal > 0 ? breadthTotal : null,
      klineRate,
      heatRate,
    ].filter((value) => value !== null && value !== undefined).length;
    const coverage = Math.round((sourceCount / 5) * 100);
    const hasDirectionalData = indexChange !== null || breadthBias !== null;
    const isPositive = hasDirectionalData
      && (indexChange ?? 0) >= 0
      && (breadthBias ?? 0) >= 0;
    const isNegative = hasDirectionalData
      && (indexChange ?? 0) < 0
      && (breadthBias ?? 0) < 0;
    const stance = isPositive ? "偏强观察" : isNegative ? "偏弱防守" : "震荡分化";
    const stanceTone: InsightTone = isPositive
      ? "positive"
      : isNegative
        ? "negative"
        : "warning";
    const risk = Math.abs(indexChange ?? 0) >= 3 || (fallShare ?? 0) >= 55;
    const confidence = coverage >= 80 ? "高" : coverage >= 50 ? "中" : "低";
    const generatedAt = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    const period = klineRate === null ? "当前快照" : "快照 + K 线窗口";
    const metrics: InsightMetric[] = [
      {
        label: "指数变化",
        value: formatSignedPercent(indexChange),
        detail: marketIndex === null ? "指数 --" : `指数 ${formatNumber(marketIndex)}`,
        tone: toneForChange(indexChange),
      },
      {
        label: "上涨广度",
        value: riseShare === null ? "--" : `${formatNumber(riseShare, 1)}%`,
        detail: `上涨 ${formatNumber(rise, 0)} / 下跌 ${formatNumber(fall, 0)}`,
        tone: toneForChange(breadthBias),
      },
      {
        label: "在线参与度",
        value: formatSignedPercent(onlineRate),
        detail: onlineCurrent === null ? "在线人数 --" : `当前 ${formatNumber(onlineCurrent, 0)} 人`,
        tone: toneForChange(onlineRate),
      },
      {
        label: "K 线趋势",
        value: formatSignedPercent(klineRate),
        detail: heatRate === null ? "热度趋势 --" : `热度 ${formatSignedPercent(heatRate)}`,
        tone: toneForChange(klineRate),
      },
    ];
    const signals: InsightSignal[] = [
      {
        label: "01",
        title: indexChange === null ? "指数数据待补齐" : indexChange >= 0 ? "指数保持上行" : "指数出现回撤",
        description: indexChange === null
          ? "当前接口暂未返回可识别的涨跌幅，报告只做结构性判断。"
          : `当前指数 ${formatNumber(marketIndex)}，较上一观察点${indexChange >= 0 ? "上升" : "下降"} ${formatNumber(Math.abs(indexChange))}%。`,
        tone: toneForChange(indexChange),
      },
      {
        label: "02",
        title: breadthBias === null ? "市场广度待补齐" : breadthBias >= 0 ? "上涨面占优" : "下跌面占优",
        description: breadthBias === null
          ? "缺少涨跌家数时，不对市场情绪做强结论。"
          : `上涨占比 ${formatNumber(riseShare, 1)}%，下跌占比 ${formatNumber(fallShare, 1)}%，广度差 ${formatSignedPercent(breadthBias)}。`,
        tone: toneForChange(breadthBias),
      },
      {
        label: "03",
        title: onlineRate === null ? "参与度待补齐" : onlineRate >= 0 ? "参与度正在放大" : "参与度有所回落",
        description: onlineRate === null
          ? "在线人数接口没有返回可比较的基准值。"
          : `当前在线 ${formatNumber(onlineCurrent, 0)} 人，较对照时段${onlineRate >= 0 ? "增加" : "减少"} ${formatNumber(Math.abs(onlineRate), 1)}%。`,
        tone: toneForChange(onlineRate),
      },
      {
        label: "04",
        title: risk ? "波动风险需要关注" : "暂未发现极端风险",
        description: risk
          ? "指数波动或下跌占比较高，适合结合价格、库存和成交数据做二次确认。"
          : "当前快照没有出现明显的单边极端信号，仍应关注 K 线和成交量变化。",
        tone: risk ? "warning" : "neutral",
      },
    ];
    const sourcesList = [
      current.market_index ?? current.index ? "指数快照" : null,
      onlineCurrent !== null ? "在线人数" : null,
      breadthTotal > 0 ? breadthSource : null,
      klineRate !== null ? "K 线序列" : null,
      heatRate !== null ? "热度序列" : null,
    ].filter((item): item is string => Boolean(item));
    const summary = `市场判断为${stance}，数据覆盖度 ${coverage}%。${risk ? "当前波动风险偏高，建议降低单一指标依赖。" : "当前信号相对平稳，可继续观察趋势确认。"}`;
    const copyText = [
      `CS 饰品市场分析报告 / ${generatedAt}`,
      `判断：${stance}｜置信度：${confidence}｜覆盖度：${coverage}%`,
      summary,
      ...metrics.map((metric) => `${metric.label}：${metric.value}（${metric.detail}）`),
      ...signals.map((signal) => `${signal.title}：${signal.description}`),
      `数据来源：${sourcesList.join("、") || "暂无可用数据"}`,
    ].join("\n");

    return {
      confidence,
      copyText,
      coverage,
      generatedAt,
      headline: `CS 饰品市场分析 / ${generatedAt}`,
      metrics,
      period,
      signals,
      sources: sourcesList,
      stance,
      stanceTone,
      summary,
    };
  });

  return { report };
}
