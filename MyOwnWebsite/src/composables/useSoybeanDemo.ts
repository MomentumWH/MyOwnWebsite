import { computed, shallowRef } from "vue";

export interface SoybeanMetric {
  label: string;
  value: string;
  trend: string;
  color: "primary" | "success" | "warning" | "info";
}

export interface SoybeanSelectOption {
  label: string;
  value: string;
}

export interface SoybeanTabItem {
  label: string;
  value: "overview" | "components" | "theme";
}

export function useSoybeanDemo() {
  const activeTab = shallowRef<SoybeanTabItem["value"]>("overview");
  const projectName = shallowRef("Soybean Studio");
  const selectedScenario = shallowRef("dashboard");
  const teamSize = shallowRef([8]);
  const enableMotion = shallowRef(true);
  const note = shallowRef("用 SoybeanUI 快速搭一个带主题、表单、进度和卡片的 Vue 3 页面。 ");

  const tabs: SoybeanTabItem[] = [
    { label: "概览", value: "overview" },
    { label: "组件", value: "components" },
    { label: "主题", value: "theme" },
  ];

  const scenarioOptions: SoybeanSelectOption[] = [
    { label: "数据看板", value: "dashboard" },
    { label: "内容中台", value: "cms" },
    { label: "设计系统", value: "design-system" },
  ];

  const metrics: SoybeanMetric[] = [
    { label: "组件覆盖", value: "12+", trend: "Buttons / Cards / Forms", color: "primary" },
    { label: "主题能力", value: "6 级", trend: "size + color tokens", color: "success" },
    { label: "交互状态", value: "Live", trend: "v-model driven", color: "info" },
  ];

  const completion = computed(() => {
    const textScore = Math.min(note.value.trim().length, 80);
    return Math.min(100, 38 + teamSize.value[0] * 4 + textScore * 0.35 + (enableMotion.value ? 10 : 0));
  });

  const scenarioLabel = computed(() => {
    return scenarioOptions.find(item => item.value === selectedScenario.value)?.label ?? "未选择";
  });

  function randomizeDemo() {
    const nextIndex = Math.floor(Math.random() * scenarioOptions.length);
    selectedScenario.value = scenarioOptions[nextIndex].value;
    teamSize.value = [Math.floor(Math.random() * 10) + 4];
    enableMotion.value = !enableMotion.value;
  }

  return {
    activeTab,
    completion,
    enableMotion,
    metrics,
    note,
    projectName,
    randomizeDemo,
    scenarioLabel,
    scenarioOptions,
    selectedScenario,
    tabs,
    teamSize,
  };
}
