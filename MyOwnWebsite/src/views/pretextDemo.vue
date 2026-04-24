<script setup lang="ts">
import { layout, prepare, type PreparedText } from "@chenglou/pretext";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const goBackHome = () => {
  router.push("/");
};

const sampleText = ref(
  "Hello Pretext! 这是一个基本使用示例。你可以修改文本、字号、宽度和行高，然后观察 Pretext 计算出的高度和行数。",
);
const containerWidth = ref(320);
const lineHeight = ref(28);
const fontSize = ref(16);
const letterSpacing = ref(0);
const whiteSpaceMode = ref<"normal" | "pre-wrap">("normal");

const prepared = ref<PreparedText | null>(null);
const measuredHeight = ref(0);
const lineCount = ref(0);
const prepareCount = ref(0);
const layoutCount = ref(0);
const errorMessage = ref("");
const isReady = ref(false);

const fontShorthand = computed(
  () =>
    `500 ${fontSize.value}px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`,
);

const previewStyle = computed(() => ({
  width: `${containerWidth.value}px`,
  font: fontShorthand.value,
  lineHeight: `${lineHeight.value}px`,
  letterSpacing: `${letterSpacing.value}px`,
  whiteSpace: whiteSpaceMode.value,
}));

const exampleCode = computed(
  () => `import { prepare, layout } from "@chenglou/pretext";

const prepared = prepare(text, ${JSON.stringify(fontShorthand.value)}, {
  whiteSpace: ${JSON.stringify(whiteSpaceMode.value)},
  letterSpacing: ${letterSpacing.value},
});

const { height, lineCount } = layout(prepared, ${containerWidth.value}, ${lineHeight.value});`,
);

const runLayout = () => {
  if (!prepared.value) {
    return;
  }

  const result = layout(prepared.value, containerWidth.value, lineHeight.value);
  measuredHeight.value = result.height;
  lineCount.value = result.lineCount;
  layoutCount.value += 1;
};

const runPrepare = () => {
  if (!isReady.value) {
    return;
  }

  try {
    prepared.value = prepare(sampleText.value, fontShorthand.value, {
      whiteSpace: whiteSpaceMode.value,
      letterSpacing: letterSpacing.value,
    });
    prepareCount.value += 1;
    errorMessage.value = "";
    runLayout();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Pretext prepare 失败";
  }
};

watch([sampleText, fontShorthand, whiteSpaceMode, letterSpacing], runPrepare);
watch([containerWidth, lineHeight], runLayout);

onMounted(async () => {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  isReady.value = true;
  runPrepare();
});
</script>

<template>
  <section class="pretext-demo-page">
    <div class="page-shell">
      <header class="page-header">
        <div>
          <span class="eyebrow">Basic Example</span>
          <h1>chenglou/pretext 基本使用示例</h1>
          <p class="intro">
            这个页面演示最基础的用法：先用 <code>prepare()</code>
            预处理文本，再用 <code>layout()</code> 根据宽度和行高计算文本高度与行数。
          </p>
        </div>

        <button type="button" class="back-button" @click="goBackHome">
          返回首页
        </button>
      </header>

      <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

      <div class="content-grid">
        <aside class="control-panel card">
          <div class="section-title">
            <h2>输入参数</h2>
            <span>{{ isReady ? "Fonts Ready" : "Waiting Fonts" }}</span>
          </div>

          <label class="field">
            <span class="field-label">文本</span>
            <textarea
              v-model="sampleText"
              class="text-input"
              spellcheck="false"
            />
          </label>

          <label class="field">
            <span class="field-label">宽度：{{ containerWidth }}px</span>
            <input
              v-model.number="containerWidth"
              type="range"
              min="200"
              max="520"
            />
          </label>

          <label class="field">
            <span class="field-label">行高：{{ lineHeight }}px</span>
            <input
              v-model.number="lineHeight"
              type="range"
              min="20"
              max="44"
            />
          </label>

          <label class="field">
            <span class="field-label">字号：{{ fontSize }}px</span>
            <input
              v-model.number="fontSize"
              type="range"
              min="14"
              max="28"
            />
          </label>

          <label class="field">
            <span class="field-label">字间距：{{ letterSpacing }}px</span>
            <input
              v-model.number="letterSpacing"
              type="range"
              min="0"
              max="4"
              step="0.5"
            />
          </label>

          <label class="field">
            <span class="field-label">white-space</span>
            <select v-model="whiteSpaceMode" class="select-input">
              <option value="normal">normal</option>
              <option value="pre-wrap">pre-wrap</option>
            </select>
          </label>
        </aside>

        <main class="result-panel">
          <section class="stats-grid">
            <article class="stat-card card">
              <span class="stat-label">prepare 次数</span>
              <strong>{{ prepareCount }}</strong>
            </article>
            <article class="stat-card card">
              <span class="stat-label">layout 次数</span>
              <strong>{{ layoutCount }}</strong>
            </article>
            <article class="stat-card card">
              <span class="stat-label">计算高度</span>
              <strong>{{ measuredHeight.toFixed(1) }}px</strong>
            </article>
            <article class="stat-card card">
              <span class="stat-label">行数</span>
              <strong>{{ lineCount }}</strong>
            </article>
          </section>

          <section class="card code-card">
            <div class="section-title">
              <h2>核心代码</h2>
            </div>
            <pre><code>{{ exampleCode }}</code></pre>
          </section>

          <section class="preview-grid">
            <article class="card preview-card">
              <div class="section-title">
                <h2>DOM 预览</h2>
                <span>{{ fontShorthand }}</span>
              </div>
              <div class="preview-box">
                <div class="text-preview" :style="previewStyle">
                  {{ sampleText }}
                </div>
              </div>
            </article>

            <article class="card preview-card">
              <div class="section-title">
                <h2>说明</h2>
              </div>
              <div class="tips-box">
                <p>
                  <code>prepare()</code> 适合放在冷路径，只在文本或字体相关参数变化时执行。
                </p>
                <p>
                  <code>layout()</code> 适合放在热路径，只根据当前宽度和行高快速计算结果。
                </p>
                <p>如果你只想拿到“高度 + 行数”，这是最简单的一套 API 组合。</p>
                <p>
                  当前参数：<code>layout(prepared, {{ containerWidth }}, {{ lineHeight }})</code>
                </p>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pretext-demo-page {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 24%),
    radial-gradient(circle at right, rgba(52, 211, 153, 0.16), transparent 26%),
    linear-gradient(160deg, #0b1220 0%, #101a2d 52%, #0f172a 100%);
}

.page-shell {
  width: min(1280px, 100%);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.14);
  color: #bfdbfe;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 14px 0 12px;
  color: #f8fafc;
  font-size: clamp(32px, 7vw, 54px);
  line-height: 1.02;
}

.intro {
  max-width: 64ch;
  margin: 0;
  color: rgba(226, 232, 240, 0.84);
  font-size: 17px;
  line-height: 1.8;
}

.intro code,
.tips-box code {
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.08);
  font-family: Consolas, "Courier New", monospace;
  font-size: 0.95em;
}

.back-button {
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
  color: #08111f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(52, 211, 153, 0.18);
}

.error-banner {
  margin: 0 0 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(185, 28, 28, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.24);
  color: #fecaca;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 20px;
}

.card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background: rgba(248, 250, 252, 0.95);
  box-shadow: 0 24px 50px rgba(2, 8, 23, 0.22);
}

.control-panel {
  padding: 22px;
  display: grid;
  gap: 16px;
  align-content: start;
}

.section-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.section-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.section-title span {
  color: rgba(15, 23, 42, 0.58);
  font-size: 12px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-label {
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.text-input,
.select-input {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.84);
}

.text-input {
  min-height: 180px;
  padding: 14px 16px;
  resize: vertical;
  color: #0f172a;
  font: 500 15px/1.7 "Segoe UI", "PingFang SC", sans-serif;
}

.select-input {
  padding: 12px 14px;
  color: #0f172a;
}

input[type="range"] {
  width: 100%;
  accent-color: #3b82f6;
}

.result-panel {
  display: grid;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px 20px;
  display: grid;
  gap: 8px;
}

.stat-label {
  color: rgba(15, 23, 42, 0.62);
  font-size: 13px;
}

.stat-card strong {
  color: #0f172a;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1;
}

.code-card {
  padding: 22px;
}

.code-card pre {
  margin: 0;
  overflow: auto;
  padding: 16px;
  border-radius: 18px;
  background: #0f172a;
  color: #dbeafe;
  font-size: 13px;
  line-height: 1.7;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.preview-card {
  padding: 22px;
  min-height: 360px;
}

.preview-box {
  overflow: auto;
}

.text-preview,
.tips-box {
  padding: 20px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.text-preview {
  color: #0f172a;
  word-break: break-word;
}

.tips-box {
  color: #1e293b;
  line-height: 1.8;
}

.tips-box p {
  margin: 0;
}

.tips-box p + p {
  margin-top: 12px;
}

@media (max-width: 1100px) {
  .content-grid,
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .pretext-demo-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
