import { describe, expect, it } from "vitest";
import { shallowRef } from "vue";
import { useItemTrendInsight } from "./useItemTrendInsight";

describe("useItemTrendInsight", () => {
  it("identifies a high-position uptrend and recommends waiting for a pullback", () => {
    const { insight } = useItemTrendInsight({
      item: shallowRef({ goods_info: { name: "AK-47 | 皇后" } }),
      lineData: shallowRef({
        main_data: [100, 102, 105, 108, 110],
        num_data: [100, 110, 120, 130, 180],
        timestamp: ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"],
      }),
      activeTimeTab: shallowRef("7"),
    });

    expect(insight.value.stance).toBe("上行但处于高位");
    expect(insight.value.recommendationTitle).toBe("购买建议：等待回调");
    expect(insight.value.metrics[0]?.value).toBe("+10.00%");
    expect(insight.value.description.length).toBeGreaterThanOrEqual(180);
    expect(insight.value.recommendation.length).toBeGreaterThanOrEqual(80);
  });

  it("degrades safely when the K-line window is incomplete", () => {
    const { insight } = useItemTrendInsight({
      item: shallowRef({ goods_info: { name: "未知饰品" } }),
      lineData: shallowRef({ main_data: [99], num_data: [] }),
      activeTimeTab: shallowRef("30"),
    });

    expect(insight.value.stance).toBe("数据待补齐");
    expect(insight.value.window).toBe("近 30 天");
    expect(insight.value.dataPoints).toBe(1);
    expect(insight.value.description.length).toBeGreaterThanOrEqual(150);
  });
});
