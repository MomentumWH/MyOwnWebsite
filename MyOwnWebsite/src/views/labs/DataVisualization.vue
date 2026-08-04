<script setup lang="ts">
import WarmProjectShowcase from "@/components/projectShowcase/WarmProjectShowcase.vue";

const features = [
  { name: "数据图表展示", icon: "图" },
  { name: "实时数据更新", icon: "流" },
  { name: "多维度分析", icon: "析" },
  { name: "导出报表", icon: "表" },
] as const;

const techStack = [
  { name: "Vue 3", icon: "V" },
  { name: "ECharts", icon: "EC" },
  { name: "Axios", icon: "AX" },
  { name: "WebSocket", icon: "WS" },
] as const;

const previewImages = [
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg",
] as const;
</script>

<template>
  <WarmProjectShowcase
    eyebrow="Data lab / Realtime insight"
    :features="features"
    :images="previewImages"
    kind="data"
    overview="这是一个聚焦数据观察、实时趋势和多维分析的数据平台。通过清晰的图表结构、模块化指标和可扩展的数据入口，帮助用户从复杂数据中快速识别变化、关联与行动信号。"
    page-code="004"
    subtitle="使用 ECharts 构建可解释的数据界面，让实时趋势、维度分析与报表输出保持同一套阅读节奏。"
    :tech-stack="techStack"
    title="数据可视化"
  />
</template>
