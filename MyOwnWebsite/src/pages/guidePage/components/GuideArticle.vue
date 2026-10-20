<script setup lang="ts">
import {
  ArrowBackOutline,
  ArrowForwardOutline,
  BulbOutline,
  TimeOutline,
} from "@vicons/ionicons5";
import type { GuideArticle } from "../content";

defineProps<{
  article: GuideArticle;
  index: number;
  total: number;
  previous?: GuideArticle;
  next?: GuideArticle;
}>();
</script>

<template>
  <article
    :id="article.id"
    class="guide-article"
    aria-labelledby="article-title"
  >
    <header class="article-header">
      <div class="article-meta">
        <span>{{ article.category }}</span>
        <span>
          <TimeOutline aria-hidden="true" />
          约 {{ article.duration }}
        </span>
        <span class="article-index">
          {{ String(index + 1).padStart(2, "0") }} /
          {{ String(total).padStart(2, "0") }}
        </span>
      </div>
      <h2 id="article-title" class="article-title">{{ article.title }}</h2>
      <p class="article-description">{{ article.description }}</p>
    </header>

    <ol v-if="article.sections.length" class="steps">
      <li
        v-for="(section, sectionIndex) in article.sections"
        :key="section.title"
        class="step"
      >
        <span class="step-number" aria-hidden="true">
          {{ String(sectionIndex + 1).padStart(2, "0") }}
        </span>
        <div class="step-body">
          <h3 class="step-title">{{ section.title }}</h3>
          <p class="step-text">{{ section.text }}</p>
          <ul v-if="section.items" class="step-items">
            <li v-for="item in section.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </li>
    </ol>

    <div v-if="article.questions" class="faq-list">
      <details
        v-for="(item, questionIndex) in article.questions"
        :key="item.question"
        class="faq-item"
        :open="questionIndex === 0"
      >
        <summary class="faq-question">
          {{ item.question }}
          <span class="faq-toggle" aria-hidden="true">+</span>
        </summary>
        <p class="faq-answer">{{ item.answer }}</p>
      </details>
    </div>

    <aside v-if="article.tip" class="article-tip">
      <BulbOutline aria-hidden="true" />
      <div>
        <strong>小提示</strong>
        <p>{{ article.tip }}</p>
      </div>
    </aside>

    <div v-if="article.links.length" class="related-links">
      <RouterLink
        v-for="link in article.links"
        :key="link.path"
        :to="link.path"
        class="related-link"
      >
        <div>
          <strong>{{ link.label }}</strong>
          <span>{{ link.description }}</span>
        </div>
        <ArrowForwardOutline aria-hidden="true" />
      </RouterLink>
    </div>

    <footer class="article-footer">
      <RouterLink
        v-if="previous"
        :to="{ name: 'guide', hash: `#${previous.id}` }"
        class="chapter-pager"
      >
        <ArrowBackOutline aria-hidden="true" />
        <span>
          <small>上一篇</small>
          {{ previous.title }}
        </span>
      </RouterLink>
      <span v-else class="first-chapter">探索，从这一篇开始。</span>
      <RouterLink
        v-if="next"
        :to="{ name: 'guide', hash: `#${next.id}` }"
        class="chapter-pager next"
      >
        <span>
          <small>继续阅读</small>
          {{ next.title }}
        </span>
        <ArrowForwardOutline aria-hidden="true" />
      </RouterLink>
      <RouterLink v-else to="/guide#quick-start" class="chapter-pager next">
        <span>
          <small>已到最后一篇</small>
          回到快速上手
        </span>
        <ArrowForwardOutline aria-hidden="true" />
      </RouterLink>
    </footer>
  </article>
</template>

<style scoped>
.guide-article {
  min-width: 0;
  scroll-margin-top: 120px;
}
.article-header {
  padding-bottom: 28px;
  border-bottom: 1px solid var(--guide-border);
}
.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  color: var(--guide-muted);
  font-size: 11px;
}
.article-meta > span:first-child {
  color: var(--guide-accent);
}
.article-meta > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.article-meta svg {
  width: 13px;
  height: 13px;
}
.article-meta .article-index {
  margin-left: auto;
  font:
    10px "Fira Code",
    monospace;
}
.article-title {
  margin: 18px 0 12px;
  color: var(--guide-text);
  font-size: clamp(24px, 2.3vw, 32px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.5;
}
.article-description {
  margin: 0;
  color: var(--guide-muted);
  font-size: 13px;
  line-height: 1.9;
}
.steps {
  display: grid;
  gap: 30px;
  margin: 32px 0;
  padding: 0;
  list-style: none;
}
.step {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}
.step-number {
  display: grid;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--guide-border);
  border-radius: 4px;
  color: var(--guide-accent);
  background: #efb47706;
  font:
    11px "Fira Code",
    monospace;
}
.step-body {
  min-width: 0;
  padding-top: 2px;
}
.step-title {
  margin: 0 0 10px;
  color: var(--guide-text);
  font-size: 16px;
  font-weight: 600;
}
.step-text,
.step-items {
  margin: 0;
  color: #c2b3aa;
  font-size: 13px;
  line-height: 2;
}
.step-items {
  display: grid;
  gap: 7px;
  margin-top: 12px;
  padding-left: 17px;
}
.step-items li::marker {
  color: var(--guide-accent);
}
.article-tip {
  display: flex;
  gap: 12px;
  padding: 20px;
  border: 1px solid #efb47724;
  border-left: 2px solid var(--guide-accent);
  border-radius: 0 4px 4px 0;
  background: #efb47707;
}
.article-tip > svg {
  flex-shrink: 0;
  width: 19px;
  height: 19px;
  color: var(--guide-accent);
}
.article-tip strong {
  color: var(--guide-accent);
  font-size: 12px;
  font-weight: 500;
}
.article-tip p {
  margin: 6px 0 0;
  color: #c2b3aa;
  font-size: 12px;
  line-height: 1.9;
}
.related-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-top: 28px;
}
.related-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--guide-border);
  border-radius: 4px;
  color: var(--guide-text);
  background: #ffd1a803;
  text-decoration: none;
  transition:
    border-color 180ms,
    background 180ms;
}
.related-link:hover {
  border-color: #efb47766;
  background: #efb47709;
}
.related-link strong {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 500;
}
.related-link span {
  color: var(--guide-muted);
  font-size: 11px;
}
.related-link svg {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--guide-accent);
}
.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 22px;
  margin-top: 38px;
  padding-top: 24px;
  border-top: 1px solid var(--guide-border);
}
.chapter-pager {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #dcc7b7;
  font-size: 12px;
  text-decoration: none;
}
.chapter-pager:hover {
  color: var(--guide-accent);
}
.chapter-pager small {
  display: block;
  margin-bottom: 6px;
  color: var(--guide-muted);
  font-size: 10px;
}
.chapter-pager svg {
  width: 16px;
  height: 16px;
}
.chapter-pager.next {
  margin-left: auto;
  text-align: right;
}
.first-chapter {
  color: var(--guide-muted);
  font-size: 11px;
}
.faq-list {
  margin: 12px 0;
}
.faq-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--guide-border);
}
.faq-question {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  color: var(--guide-text);
  font-size: 14px;
  line-height: 1.8;
  cursor: pointer;
  list-style: none;
}
.faq-question::-webkit-details-marker {
  display: none;
}
.faq-toggle {
  color: var(--guide-accent);
  font-size: 20px;
}
.faq-item[open] .faq-toggle {
  transform: rotate(45deg);
}
.faq-answer {
  margin: 14px 28px 0 0;
  color: #c2b3aa;
  font-size: 13px;
  line-height: 2;
}
@media (max-width: 480px) {
  .step {
    gap: 12px;
  }
  .article-tip,
  .related-link {
    padding: 16px;
  }
  .first-chapter {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .related-link {
    transition: none;
  }
}
</style>
