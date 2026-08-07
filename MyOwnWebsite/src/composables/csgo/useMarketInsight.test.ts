import { describe, expect, it } from "vitest";
import { shallowRef } from "vue";
import { useMarketInsight } from "./useMarketInsight";

describe("useMarketInsight", () => {
  it("builds a bullish report from index, breadth and participation data", () => {
    const { report } = useMarketInsight({
      currentTab: shallowRef({ market_index: 2150, chg_rate: 1.2 }),
      heatLineData: shallowRef([["day-1", 80], ["day-2", 96]]),
      kLineData: shallowRef([{ c: "100" }, { c: "104" }]),
      onlineData: shallowRef({ current_number: 1000, same_time_number: 900, rate: 11.1 }),
      riseFallData: shallowRef({
        rise: 70,
        flat: 20,
        fall: 10,
        sourceLabel: "子指数涨跌分布",
      }),
    });

    expect(report.value.stance).toBe("偏强观察");
    expect(report.value.coverage).toBe(100);
    expect(report.value.metrics[0]?.value).toBe("+1.20%");
    expect(report.value.sources).toEqual([
      "指数快照",
      "在线人数",
      "子指数涨跌分布",
      "K 线序列",
      "热度序列",
    ]);
  });

  it("degrades to a low-confidence report when interfaces return no data", () => {
    const { report } = useMarketInsight({
      currentTab: shallowRef(null),
      heatLineData: shallowRef([]),
      kLineData: shallowRef([]),
      onlineData: shallowRef(null),
      riseFallData: shallowRef({ rise: 0, flat: 0, fall: 0 }),
    });

    expect(report.value.stance).toBe("震荡分化");
    expect(report.value.confidence).toBe("低");
    expect(report.value.coverage).toBe(0);
    expect(report.value.summary).toContain("数据覆盖度 0%");
  });
});
