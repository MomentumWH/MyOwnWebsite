<script setup lang="ts">
import { computed } from "vue";
import { ArrowForwardOutline } from "@vicons/ionicons5";
import { guideCategories, type GuideArticle } from "../content";

const props = defineProps<{
  articles: readonly GuideArticle[];
  activeId: string;
  searching: boolean;
}>();
defineEmits<{ select: [] }>();

const groups = computed(() =>
  guideCategories
    .map((category) => ({
      category,
      articles: props.articles.filter(
        (article) => article.category === category,
      ),
    }))
    .filter((group) => group.articles.length > 0),
);
</script>

<template>
  <aside class="guide-sidebar">
    <nav class="chapter-nav" aria-label="教程章节">
      <p class="directory-label">
        阅读目录
        <span>CONTENTS</span>
      </p>
      <div v-for="group in groups" :key="group.category" class="chapter-group">
        <h2 class="group-title">{{ group.category }}</h2>
        <RouterLink
          v-for="article in group.articles"
          :key="article.id"
          :to="{ name: 'guide', hash: `#${article.id}` }"
          class="chapter-link"
          :class="{ 'is-active': !searching && article.id === activeId }"
          :aria-current="
            !searching && article.id === activeId ? 'page' : undefined
          "
          @click="$emit('select')"
        >
          <span>{{ article.title }}</span>
          <ArrowForwardOutline aria-hidden="true" />
        </RouterLink>
      </div>
      <p v-if="groups.length === 0" class="sidebar-empty">没有匹配的章节</p>
    </nav>
    <div class="sidebar-note">
      <span class="note-index">随时回来，继续探索。</span>
      <p>
        教程始终开放阅读。
        <br />
        选择章节，即可获得可分享的链接。
      </p>
      <RouterLink to="/">返回项目首页 ↗</RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.guide-sidebar {
  position: sticky;
  top: 110px;
  align-self: start;
}
.directory-label {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 30px;
  color: var(--guide-text);
  font-size: 13px;
}
.directory-label span {
  color: var(--guide-muted);
  font:
    9px "Fira Code",
    monospace;
  letter-spacing: 0.13em;
}
.chapter-group {
  margin-bottom: 24px;
}
.group-title {
  margin: 0 0 9px;
  color: var(--guide-muted);
  font-size: 11px;
  font-weight: 400;
}
.chapter-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 3px -10px;
  padding: 12px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #cdbdb3;
  font-size: 12px;
  text-decoration: none;
  transition:
    color 160ms,
    background 160ms;
}
.chapter-link svg {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  opacity: 0;
}
.chapter-link:hover {
  color: var(--guide-accent);
  background: #ffc78c06;
}
.chapter-link.is-active {
  border-color: #efb47722;
  background: #efb4770c;
  color: var(--guide-accent);
}
.chapter-link.is-active svg {
  opacity: 1;
}
.sidebar-empty {
  color: var(--guide-muted);
  font-size: 12px;
}
.sidebar-note {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--guide-border);
}
.note-index {
  color: var(--guide-text);
  font-size: 12px;
}
.sidebar-note p {
  color: var(--guide-muted);
  font-size: 11px;
  line-height: 1.9;
}
.sidebar-note a {
  color: var(--guide-accent);
  font-size: 11px;
  text-decoration: none;
}
@media (max-width: 800px) {
  .guide-sidebar {
    position: static;
  }
  .chapter-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
  }
  .directory-label {
    grid-column: 1 / -1;
    margin-bottom: 20px;
  }
  .chapter-link {
    padding: 10px;
  }
  .sidebar-note {
    display: none;
  }
}
@media (max-width: 420px) {
  .chapter-nav {
    grid-template-columns: 1fr;
  }
  .chapter-group {
    margin-bottom: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .chapter-link {
    transition: none;
  }
}
</style>
