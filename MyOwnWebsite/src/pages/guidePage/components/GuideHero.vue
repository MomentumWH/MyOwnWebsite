<script setup lang="ts">
import {
  ArrowForwardOutline,
  BookOutline,
  SearchOutline,
} from "@vicons/ionicons5";

defineProps<{ articleCount: number }>();
const query = defineModel<string>({ required: true });
</script>

<template>
  <header class="guide-hero">
    <div class="hero-copy">
      <p class="eyebrow">
        <span class="status-dot"></span>
        CHONNY LAB / HANDBOOK
      </p>
      <h1 class="hero-title">
        让探索，
        <br />
        从
        <span>了解开始。</span>
      </h1>
      <p class="hero-description">
        欢迎来到教程中心。从第一次使用到功能进阶，
        <br class="desktop-break" />
        在这里找到清晰的指引，按自己的节奏探索。
      </p>
      <div class="hero-meta">
        <span>公开阅读 · 无需登录</span>
        <span>{{ articleCount }} 篇使用指南</span>
      </div>
    </div>
    <div class="hero-tools">
      <div class="handbook-label">
        <BookOutline aria-hidden="true" />
        <span>系统使用教程</span>
        <span class="handbook-index">
          01 — {{ String(articleCount).padStart(2, "0") }}
        </span>
      </div>
      <label class="search-label" for="guide-search">想了解什么？</label>
      <div class="search-field">
        <SearchOutline class="search-icon" aria-hidden="true" />
        <input
          id="guide-search"
          v-model="query"
          class="search-input"
          type="search"
          placeholder="搜索功能、操作或问题…"
          autocomplete="off"
        />
        <kbd class="search-hint" aria-hidden="true">搜索</kbd>
      </div>
      <p class="search-help">搜索教程全文，或从下方目录开始阅读。</p>
      <RouterLink
        class="start-link"
        to="/guide#quick-start"
        @click="query = ''"
      >
        第一次来？从快速上手开始
        <ArrowForwardOutline aria-hidden="true" />
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.guide-hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 72px;
  align-items: center;
  padding: 70px 0 56px;
  border-bottom: 1px solid var(--guide-border);
}
.eyebrow {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 0 0 24px;
  color: var(--guide-muted);
  font:
    11px "Fira Code",
    monospace;
  letter-spacing: 0.13em;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--guide-accent);
  box-shadow: 0 0 12px #edb27655;
}
.hero-title {
  margin: 0;
  color: var(--guide-text);
  font-size: clamp(38px, 4.5vw, 62px);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.04em;
}
.hero-title span {
  color: var(--guide-accent);
}
.hero-description {
  margin: 22px 0;
  color: var(--guide-muted);
  font-size: 14px;
  line-height: 1.95;
}
.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 22px;
  color: #c4b4a9;
  font-size: 11px;
}
.hero-meta span + span {
  padding-left: 22px;
  border-left: 1px solid var(--guide-border);
}
.hero-tools {
  padding: 30px;
  border: 1px solid var(--guide-border);
  border-radius: 6px;
  background: linear-gradient(135deg, #ffc58a09, #ffc58a02);
}
.handbook-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 34px;
  color: var(--guide-accent);
  font-size: 12px;
}
.handbook-label svg {
  width: 19px;
  height: 19px;
}
.handbook-index {
  margin-left: auto;
  color: var(--guide-muted);
  font:
    10px "Fira Code",
    monospace;
}
.search-label {
  display: block;
  margin-bottom: 14px;
  color: var(--guide-text);
  font-size: 20px;
  font-weight: 600;
}
.search-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 0 14px;
  border: 1px solid #ffd1a82b;
  border-radius: 4px;
  background: #140c0ed9;
}
.search-field:focus-within {
  border-color: var(--guide-accent);
  box-shadow: 0 0 0 3px #efb47710;
}
.search-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--guide-muted);
}
.search-input {
  width: 100%;
  min-width: 0;
  padding: 14px 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--guide-text);
  font: inherit;
  font-size: 13px;
}
.search-input::placeholder {
  color: #9c8980;
}
.search-hint {
  flex-shrink: 0;
  padding: 3px 5px;
  border: 1px solid var(--guide-border);
  border-radius: 3px;
  color: var(--guide-muted);
  font: inherit;
  font-size: 10px;
}
.search-help {
  margin: 10px 0 27px;
  color: var(--guide-muted);
  font-size: 11px;
}
.start-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--guide-accent);
  font-size: 12px;
  text-decoration: none;
}
.start-link svg {
  width: 16px;
  height: 16px;
  transition: transform 180ms;
}
.start-link:hover svg {
  transform: translateX(4px);
}
@media (max-width: 800px) {
  .guide-hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 0 32px;
  }
  .hero-title {
    font-size: 42px;
  }
  .hero-tools {
    padding: 24px;
  }
  .handbook-label {
    margin-bottom: 24px;
  }
}
@media (max-width: 420px) {
  .desktop-break {
    display: none;
  }
  .search-hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .start-link svg {
    transition: none;
  }
}
</style>
