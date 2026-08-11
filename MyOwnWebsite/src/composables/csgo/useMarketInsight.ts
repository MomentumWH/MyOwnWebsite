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

export interface InsightDistributionItem {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface InsightTrendPoint {
  label: string;
  value: number;
}

export interface InsightTrendSeries {
  name: string;
  unit: string;
  color: string;
  change: number | null;
  points: InsightTrendPoint[];
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
  distribution: InsightDistributionItem[];
  trends: InsightTrendSeries[];
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

const formatSeriesLabel = (value: unknown, index: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }
  }

  if (typeof value === "string" && value.trim()) {
    return value.length > 10 ? value.slice(5, 16) : value;
  }

  return `${index + 1}`;
};

const buildTrendPoints = (
  value: unknown,
  keys: string[],
  limit = 24,
): InsightTrendPoint[] => toSeries(value)
  .map((item, index) => {
    const pointValue = readNumber(item, ...keys, "value");
    if (pointValue === null) {
      return null;
    }

    return {
      label: formatSeriesLabel(
        item.time ?? item.t ?? item.date ?? item.updated_at,
        index,
      ),
      value: pointValue,
    };
  })
  .filter((item): item is InsightTrendPoint => item !== null)
  .slice(-limit);

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
    const klineData = toValue(sources.kLineData);
    const heatLineData = toValue(sources.heatLineData);
    const klineRate = calculateSeriesRate(klineData, ["c", "close"]);
    const heatRate = calculateSeriesRate(heatLineData, ["value", "m"]);
    const klinePoints = buildTrendPoints(klineData, ["c", "close"]);
    const heatPoints = buildTrendPoints(heatLineData, ["value", "m"]);
    const distribution: InsightDistributionItem[] = breadthTotal > 0
      ? [
          { name: "上涨", value: rise, percent: (rise / breadthTotal) * 100, color: "#55d6b0" },
          { name: "持平", value: flat, percent: (flat / breadthTotal) * 100, color: "#f5b74f" },
          { name: "下跌", value: fall, percent: (fall / breadthTotal) * 100, color: "#ff7767" },
        ]
      : [];
    const trends: InsightTrendSeries[] = [
      {
        name: "指数 K 线窗口",
        unit: "点",
        color: "#55d6b0",
        change: klineRate,
        points: klinePoints,
      },
      {
        name: "市场热度趋势",
        unit: "热度",
        color: "#f5b74f",
        change: heatRate,
        points: heatPoints,
      },
    ];
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
    const directionAligned = indexChange !== null
      && klineRate !== null
      && Math.sign(indexChange) === Math.sign(klineRate);
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
          ? "当前接口暂未返回可识别的指数涨跌幅，现阶段只能结合市场广度、在线人数和热度序列做结构性判断。建议等待指数快照补齐后，再核对短周期高低点是否连续抬升或下移，避免因单项数据缺失而放大方向判断的误差。"
          : `当前指数 ${formatNumber(marketIndex)}，较上一观察点${indexChange >= 0 ? "上升" : "下降"} ${formatNumber(Math.abs(indexChange))}%，K 线窗口累计变化为 ${formatSignedPercent(klineRate)}。${klineRate === null ? "由于历史窗口暂未完整返回，当前方向仍属于快照判断，需要后续数据确认持续性。" : directionAligned ? "快照方向与窗口趋势一致，短周期信号具备一定连续性，但仍需观察成交和库存是否同步配合。" : "快照方向与窗口趋势存在背离，可能处在反弹、回撤或方向切换阶段，不宜仅依据单次涨跌追随。"}`,
        tone: toneForChange(indexChange),
      },
      {
        label: "02",
        title: breadthBias === null ? "市场广度待补齐" : breadthBias >= 0 ? "上涨面占优" : "下跌面占优",
        description: breadthBias === null
          ? "当前缺少可验证的上涨、持平与下跌样本，报告不会用静态演示数据替代真实市场广度。指数单独上涨并不等于多数饰品同步走强，建议等待分布数据恢复后，再判断行情是普涨扩散、少数权重拉动，还是结构性分化。"
          : `本次统计覆盖 ${formatNumber(breadthTotal, 0)} 个${breadthSource}样本，上涨占比 ${formatNumber(riseShare, 1)}%，下跌占比 ${formatNumber(fallShare, 1)}%，广度差为 ${formatSignedPercent(breadthBias)}。${breadthBias >= 0 ? "上涨样本数量占优，说明正向情绪具有一定扩散度；若后续持平占比下降且上涨占比继续提高，趋势质量会进一步增强。" : "下跌样本数量占优，说明压力并非集中在单个分类；若指数仍保持上涨，应警惕少数权重品种掩盖整体走弱。"}`,
        tone: toneForChange(breadthBias),
      },
      {
        label: "03",
        title: onlineRate === null ? "参与度待补齐" : onlineRate >= 0 ? "参与度正在放大" : "参与度有所回落",
        description: onlineRate === null
          ? "在线人数接口暂未返回可比较的当前值和对照值，因此无法确认本轮价格变化是否获得真实参与度支持。建议将后续在线人数、成交量和市场热度放在同一时间窗口观察，只有参与度与价格方向同步，趋势延续的可信度才会更高。"
          : `当前在线 ${formatNumber(onlineCurrent, 0)} 人，较对照时段${onlineRate >= 0 ? "增加" : "减少"} ${formatNumber(Math.abs(onlineRate), 1)}%，市场热度窗口变化为 ${formatSignedPercent(heatRate)}。${onlineRate >= 0 ? "参与人数正在扩张，若热度和指数同步上行，通常有利于价格趋势延续；若热度反向下降，则可能只是短时登录增长，交易意愿仍需成交数据确认。" : "参与人数回落意味着边际活跃度减弱，即使指数暂时上涨，也需要防范流动性不足导致的价格波动放大。"}`,
        tone: toneForChange(onlineRate),
      },
      {
        label: "04",
        title: risk ? "波动风险需要关注" : "暂未发现极端风险",
        description: risk
          ? `当前指数波动幅度或下跌占比已经进入需要关注的区间，报告覆盖度为 ${coverage}%，置信度为${confidence}。建议降低对单一指标的依赖，重点核对高价饰品库存、成交深度和平台价差；若下跌广度继续扩大且参与度同步回落，应优先控制追高和流动性风险。`
          : `当前快照尚未出现明显的单边极端信号，报告覆盖度为 ${coverage}%，置信度为${confidence}。指数、广度和参与度整体仍处于可观察区间，但这并不代表风险消失；后续应持续核对 K 线拐点、热度变化、成交量和库存增减，确认趋势是否获得更多数据支持。`,
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
    const summary = `综合指数方向、市场广度、在线参与度、K 线与热度窗口后，当前市场判断为${stance}，数据覆盖度 ${coverage}%，置信度为${confidence}。${risk ? "波动或下跌扩散信号偏强，应结合成交深度、库存与平台价差继续确认，避免依据单一指标追涨杀跌。" : "各项信号暂未显示极端失衡，可继续观察指数方向是否获得广度和参与度的同步确认。"}`;
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
      distribution,
      generatedAt,
      headline: `CS 饰品市场分析 / ${generatedAt}`,
      metrics,
      period,
      signals,
      sources: sourcesList,
      stance,
      stanceTone,
      summary,
      trends,
    };
  });

  return { report };
}
