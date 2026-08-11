import { computed, toValue, type MaybeRefOrGetter } from "vue";

export type ItemInsightTone = "positive" | "negative" | "warning" | "neutral";

export interface ItemInsightMetric {
  label: string;
  value: string;
  detail: string;
  tone: ItemInsightTone;
}

export interface ItemTrendInsight {
  title: string;
  stance: string;
  stanceTone: ItemInsightTone;
  window: string;
  dataPoints: number;
  description: string;
  recommendationTitle: string;
  recommendation: string;
  recommendationTone: ItemInsightTone;
  metrics: ItemInsightMetric[];
  copyText: string;
}

export interface ItemTrendInsightSources {
  item: MaybeRefOrGetter<unknown>;
  lineData: MaybeRefOrGetter<unknown>;
  activeTimeTab: MaybeRefOrGetter<string>;
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
    const parsed = Number(value.replace(/[,%$¥\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
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

const formatPrice = (value: number | null) =>
  value === null ? "--" : `¥${formatNumber(value)}`;

const formatSignedPercent = (value: number | null) => {
  if (value === null) {
    return "--";
  }

  return `${value >= 0 ? "+" : ""}${formatNumber(value)}%`;
};

const safeRate = (current: number | null, base: number | null) => {
  if (current === null || base === null || base === 0) {
    return null;
  }

  return ((current - base) / Math.abs(base)) * 100;
};

const windowLabel = (value: string) => ({
  "7": "近 7 天",
  "30": "近 30 天",
  "90": "近三个月",
  "180": "近半年",
  "365": "近一年",
  "1095": "近三年",
}[value] ?? `近 ${value} 个周期`);

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

const standardDeviation = (values: number[]) => {
  const mean = average(values);
  if (mean === null || values.length < 2) {
    return null;
  }

  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const readSeries = (value: unknown) => {
  const record = asRecord(value);
  const prices = Array.isArray(record.main_data)
    ? record.main_data.map(toNumber).filter((item): item is number => item !== null && item > 0)
    : [];
  const volumes = Array.isArray(record.num_data)
    ? record.num_data.map(toNumber).filter((item): item is number => item !== null && item >= 0)
    : [];

  return { prices, volumes };
};

export function useItemTrendInsight(sources: ItemTrendInsightSources) {
  const insight = computed<ItemTrendInsight>(() => {
    const item = asRecord(toValue(sources.item));
    const goods = asRecord(item.goods_info);
    const { prices, volumes } = readSeries(toValue(sources.lineData));
    const period = windowLabel(toValue(sources.activeTimeTab));
    const itemName = typeof goods.name === "string" && goods.name.trim()
      ? goods.name
      : "当前饰品";

    if (prices.length < 2) {
      const description = `${itemName}当前仅获得 ${prices.length} 个有效价格点，暂时不足以完成可靠的趋势、波动和支撑压力判断。此时页面上的最新报价只能作为静态参考，不能代表完整的周期走势，也无法确认当前价格是在反弹起点、区间中部还是下跌途中；建议等待至少形成连续价格窗口后，再结合成交量、平台库存、买卖价差和后续低点是否抬高判断是否适合入场，避免因为数据过少而把偶然报价误认为买入机会。`;
      const recommendation = "暂不急于买入，先等待有效 K 线窗口补齐，并同时核对当前在售价与求购价的差距，避免在信息不足时承担不必要的流动性风险。";

      return {
        title: `${itemName} · 单品走势分析`,
        stance: "数据待补齐",
        stanceTone: "neutral",
        window: period,
        dataPoints: prices.length,
        description,
        recommendationTitle: "购买建议：等待确认",
        recommendation,
        recommendationTone: "neutral",
        metrics: [
          { label: "最新价格", value: formatPrice(prices.at(-1) ?? null), detail: "有效点不足", tone: "neutral" },
          { label: "窗口变化", value: "--", detail: "至少需要 2 个点", tone: "neutral" },
          { label: "波动率", value: "--", detail: "等待连续序列", tone: "neutral" },
          { label: "成交活跃度", value: "--", detail: "等待成交数据", tone: "neutral" },
        ],
        copyText: `${itemName}单品走势分析\n${description}\n${recommendation}`,
      };
    }

    const latest = prices.at(-1) ?? null;
    const first = prices[0] ?? null;
    const previous = prices.at(-2) ?? null;
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const change = safeRate(latest, first);
    const latestChange = safeRate(latest, previous);
    const priceRange = safeRate(highest, lowest);
    const averagePrice = average(prices);
    const ma5 = average(prices.slice(-5));
    const returns = prices.slice(1).map((price, index) => safeRate(price, prices[index])).filter(
      (value): value is number => value !== null,
    );
    const volatility = standardDeviation(returns);
    const averageVolume = average(volumes);
    const latestVolume = volumes.at(-1) ?? null;
    const volumeRate = safeRate(latestVolume, averageVolume);
    const distanceToHigh = safeRate(highest, latest);
    const distanceToLow = safeRate(latest, lowest);
    const isAboveMa = latest !== null && ma5 !== null && latest >= ma5;
    const isStrongUp = (change ?? 0) >= 3 && isAboveMa;
    const isStrongDown = (change ?? 0) <= -3 && !isAboveMa;
    const isHighPosition = (distanceToHigh ?? 0) <= 3;
    const isLowPosition = (distanceToLow ?? 0) <= 3;
    const riskTone: ItemInsightTone = volatility !== null && volatility >= 8
      ? "warning"
      : "neutral";
    const stance = isStrongUp
      ? isHighPosition ? "上行但处于高位" : "趋势偏强"
      : isStrongDown
        ? "趋势偏弱"
        : "区间震荡";
    const stanceTone: ItemInsightTone = isStrongUp
      ? "positive"
      : isStrongDown
        ? "negative"
        : "warning";
    const recommendationTitle = isStrongDown
      ? "购买建议：暂缓追价"
      : isStrongUp && isHighPosition
        ? "购买建议：等待回调"
        : isStrongUp
          ? "购买建议：分批关注"
          : isLowPosition
            ? "购买建议：小仓观察"
            : "购买建议：区间等待";
    const recommendationTone: ItemInsightTone = isStrongDown
      ? "negative"
      : isStrongUp && !isHighPosition
        ? "positive"
        : "warning";
    const positionText = isHighPosition
      ? "当前价格靠近窗口高位"
      : isLowPosition
        ? "当前价格靠近窗口低位"
        : "当前价格位于窗口中部";
    const volumeText = volumeRate === null
      ? "成交量基准暂未完整返回"
      : volumeRate >= 15
        ? `最新成交量较窗口均值放大 ${formatNumber(volumeRate, 1)}%`
        : volumeRate <= -15
          ? `最新成交量较窗口均值收缩 ${formatNumber(Math.abs(volumeRate), 1)}%`
          : "最新成交量与窗口均值接近";
    const description = `在${period}的 ${prices.length} 个有效价格点中，${itemName}最新价格为 ${formatPrice(latest)}，较窗口起点${change !== null && change >= 0 ? "上涨" : "下跌"} ${formatNumber(Math.abs(change ?? 0), 2)}%，窗口最高 ${formatPrice(highest)}、最低 ${formatPrice(lowest)}，区间振幅约 ${formatNumber(priceRange, 2)}%。当前价格${isAboveMa ? "位于" : "低于"} MA5 ${formatPrice(ma5)}，${positionText}；${volumeText}。短线单点变化为 ${formatSignedPercent(latestChange)}，收益机会与回撤风险同时存在，建议将趋势方向、价格位置和流动性一起判断，而不是只看最新涨跌幅。`;
    const recommendation = isStrongDown
      ? `价格处于偏弱结构且${isAboveMa ? "尚未跌破" : "低于"}短期均线，当前不适合追价买入。建议先观察价格能否在 ${formatPrice(lowest)} 附近止跌，并等待成交量从收缩转为稳定；若反弹仍无法站回 MA5，优先保留现金，避免在下行趋势中承受持续回撤。`
      : isStrongUp && isHighPosition
        ? `趋势虽然偏强，但价格已接近窗口压力 ${formatPrice(highest)}，不建议一次性重仓追高。更稳妥的方式是等待回落至 MA5 ${formatPrice(ma5)} 附近、成交量没有明显恶化时分批建仓，并提前设定可接受的回撤边界；若放量突破前高，再考虑提高仓位。`
        : isStrongUp
          ? `价格方向和短期均线保持偏强，适合采用分批、限额的方式关注，而不是一次性买入。优先等待小幅回踩后确认 MA5 支撑，同时观察成交量是否维持在窗口均值附近；若价格跌破支撑或波动率快速升高，应暂停加仓并重新评估。`
          : isLowPosition
            ? `当前价格靠近窗口低位，具备观察价值但不等于已经反转。可以用小仓位试探，重点等待低点抬高、价格重新站上 MA5 以及成交量恢复三个信号；在这些条件出现前，不建议因为价格便宜而提前重仓，止损和资金占用需要优先控制。`
            : `当前价格位于区间中部，方向信号尚未形成明显优势。建议先设定目标买入区间，等待价格靠近支撑 ${formatPrice(lowest)} 或有效突破压力 ${formatPrice(highest)} 再行动；若必须配置，可采用小额分批方式，避免在震荡中频繁追涨杀跌。`;

    const metrics: ItemInsightMetric[] = [
      { label: "窗口变化", value: formatSignedPercent(change), detail: `${period}起点至今`, tone: change === null ? "neutral" : change >= 0 ? "positive" : "negative" },
      { label: "价格位置", value: isHighPosition ? "高位" : isLowPosition ? "低位" : "中位", detail: `${formatPrice(lowest)} - ${formatPrice(highest)}`, tone: isHighPosition ? "warning" : isLowPosition ? "positive" : "neutral" },
      { label: "波动率", value: volatility === null ? "--" : `${formatNumber(volatility, 1)}%`, detail: volatility !== null && volatility >= 8 ? "波动偏高" : "波动可控", tone: riskTone },
      { label: "成交活跃度", value: formatSignedPercent(volumeRate), detail: latestVolume === null ? "成交量 --" : `最新 ${formatNumber(latestVolume, 0)}`, tone: volumeRate === null ? "neutral" : volumeRate >= 0 ? "positive" : "negative" },
    ];

    return {
      title: `${itemName} · 单品走势分析`,
      stance,
      stanceTone,
      window: period,
      dataPoints: prices.length,
      description,
      recommendationTitle,
      recommendation,
      recommendationTone,
      metrics,
      copyText: [
        `${itemName}单品走势分析 / ${period}`,
        description,
        `${recommendationTitle}：${recommendation}`,
        `参考位：支撑 ${formatPrice(lowest)}，压力 ${formatPrice(highest)}，MA5 ${formatPrice(ma5)}`,
      ].join("\n"),
    };
  });

  return { insight };
}
