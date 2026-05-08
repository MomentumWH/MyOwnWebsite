import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from "vue";
import * as echarts from "echarts";
import type { ECharts } from "echarts";
import dayjs from "dayjs";
import { getOneChart } from "@/services/CSQaQ";

type MaybeId = string | number | undefined;

type ChartTab = {
  label: string;
  value: string;
};

type ChartData = {
  main_data?: Array<number | string>;
  num_data?: Array<number | string>;
  timestamp?: Array<string | number>;
};

export function useItemDetailChart(currentId: Ref<MaybeId>) {
  const detailChartRef = ref<HTMLElement | null>(null);
  const lineData = ref<ChartData | null>(null);
  const activeTimeTab = ref("7");
  const timeTabs: ChartTab[] = [
    { label: "近7天", value: "7" },
    { label: "近30天", value: "30" },
    { label: "近三个月", value: "90" },
    { label: "近半年", value: "180" },
    { label: "近一年", value: "365" },
    { label: "近三年", value: "1095" },
  ];

  let detailChartInstance: ECharts | null = null;

  const calculateMA = (dayCount: number, data: Array<number | string>) => {
    const result: Array<string> = [];

    for (let i = 0; i < data.length; i += 1) {
      if (i < dayCount - 1) {
        result.push("-");
        continue;
      }

      let sum = 0;
      for (let j = 0; j < dayCount; j += 1) {
        sum += Number.parseFloat(String(data[i - j]));
      }
      result.push((sum / dayCount).toFixed(2));
    }

    return result;
  };

  const initDetailChart = () => {
    if (!detailChartRef.value || !lineData.value) {
      return;
    }

    if (!detailChartInstance) {
      detailChartInstance = echarts.init(detailChartRef.value);
    }

    const prices = lineData.value.main_data ?? [];
    const volumes = lineData.value.num_data ?? [];
    const timestamps = lineData.value.timestamp ?? [];
    const formattedTimestamps = timestamps.map((item) =>
      dayjs(item).format("YYYY-MM-DD"),
    );
    const ma5Data = calculateMA(5, prices);
    const ma10Data = calculateMA(10, prices);
    const ma20Data = calculateMA(20, prices);
    const ma30Data = calculateMA(30, prices);

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
        position() {
          return {
            left: 20,
            top: 20,
          };
        },
        formatter: (params: Array<{ dataIndex: number }>) => {
          if (!params.length) {
            return "";
          }

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
            const prevPrice = Number(prices[dataIndex - 1]);
            const currentPrice = Number(price);

            change = (currentPrice - prevPrice).toFixed(2);
            changePercent =
              (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2) + "%";
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
              ${dataIndex > 0 ? `<span style="color: ${Number.parseFloat(change) >= 0 ? "#10b981" : "#ef4444"}; font-size: 13px; font-weight: 500;">${Number.parseFloat(change) >= 0 ? "+" : ""}${change} (${changePercent})</span>` : ""}
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
            color: (params: { dataIndex: number }) => {
              const idx = params.dataIndex;
              return idx > 0 && Number(prices[idx]) >= Number(prices[idx - 1])
                ? "#10b981"
                : "#ef4444";
            },
          },
        },
      ],
    };

    detailChartInstance.setOption(option, true);
  };

  const fetchChart = async (id: MaybeId) => {
    if (!id) {
      return;
    }

    const { data } = await getOneChart({
      good_id: id,
      key: "sell_price",
      platform: 2,
      period: activeTimeTab.value,
      style: "all_style",
    });

    lineData.value = data;
  };

  const changeLineTime = async (tab: ChartTab) => {
    activeTimeTab.value = tab.value;
    await fetchChart(currentId.value);
  };

  const handleResize = () => {
    detailChartInstance?.resize();
  };

  watch(lineData, async (newData) => {
    if (!newData) {
      return;
    }

    await nextTick();
    initDetailChart();
  });

  onMounted(() => {
    window.addEventListener("resize", handleResize);
  });

  onUnmounted(() => {
    detailChartInstance?.dispose();
    detailChartInstance = null;
    window.removeEventListener("resize", handleResize);
  });

  return {
    detailChartRef,
    lineData,
    timeTabs,
    activeTimeTab,
    fetchChart,
    changeLineTime,
  };
}
