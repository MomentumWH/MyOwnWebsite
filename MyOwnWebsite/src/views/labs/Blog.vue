<script setup lang="ts">
import WarmProjectShowcase from "@/components/projectShowcase/WarmProjectShowcase.vue";

const features = [
  { name: "文章发布和管理", icon: "文" },
  { name: "分类和标签系统", icon: "签" },
  { name: "评论和回复功能", icon: "谈" },
  { name: "响应式阅读体验", icon: "阅" },
] as const;

const techStack = [
  { name: "Vue 3 + Composition API", icon: "V" },
  { name: "Vite", icon: "⚡" },
  { name: "TypeScript", icon: "TS" },
  { name: "Markdown 编辑器", icon: "MD" },
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
    eyebrow="Content lab / Editorial system"
    :features="features"
    :images="previewImages"
    kind="editorial"
    overview="这是一个面向内容创作与知识沉淀的个人博客系统，覆盖文章发布、分类标签、评论互动和响应式阅读体验。信息架构围绕长期阅读与内容管理展开，让文字本身成为页面的视觉重心。"
    page-code="002"
    subtitle="使用 Vue 3 与 Vite 构建内容系统，在清晰的阅读秩序中连接创作、归档和互动。"
    :tech-stack="techStack"
    title="个人博客"
  />
</template>
