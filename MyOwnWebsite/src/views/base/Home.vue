<script setup lang="ts">
import ProjectNav from "@/components/projectNav/index.vue";
import UploadBox from "@/components/uploadByNaviUI/index.vue";
import { useDialog, useMessage } from "naive-ui";
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowForwardOutline as ArrowIcon,
  CloudUploadOutline as UploadIcon,
  MoveOutline as MoveIcon,
} from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import TypeIt from "typeit";

const message = useMessage();
const dialog = useDialog();
const authStore = useAuthStore();
const router = useRouter();
const typePrinterMaker = useTemplateRef<HTMLElement>("typePrinterMaker");

const profile = {
  name: "张三",
  title: "前端开发工程师",
  avatar:
    "https://pic.youpinimg.com/prod/client_dir/R6F03F696DB344057BCD5B68E6ABD2637.webp?x-oss-process=image/format,webp/quality,Q_100",
  bio: "热爱编程，专注于前端技术，擅长 Vue、React 等框架。",
  skills: ["Vue 3", "TypeScript", "JavaScript", "HTML/CSS", "Node.js"],
  projects: [
    {
      name: "个人博客",
      label: "Editorial System",
      description: "使用 Vue 3 和 Vite 构建的个人博客系统",
    },
    {
      name: "电商平台",
      label: "Commerce Lab",
      description: "基于 Nuxt 3 的电商平台项目",
    },
    {
      name: "数据可视化",
      label: "Data Interface",
      description: "使用 ECharts 实现的数据分析平台",
    },
    {
      name: "CS饰品数据",
      label: "Market Intelligence",
      description: "CS饰品行情数据展示和分析平台",
    },
    {
      name: "阿森纳赛季走势",
      label: "Football Intelligence",
      description: "英超赛果记录、积分走势和比赛概率预测模块",
    },
  ],
} as const;

const stats = [
  { value: "05", label: "Core skills" },
  { value: "05", label: "Selected works" },
  { value: "01", label: "Live data lab" },
] as const;

const isShowUploadBox = shallowRef(false);
let typeItInstance: TypeIt | null = null;

const goToCheckProjectRoute = (name: string) => {
  const projectRoutes: Record<string, string> = {
    个人博客: "/blog",
    电商平台: "/ecommerce",
    数据可视化: "/data-visualization",
    CS饰品数据: "/cs-items",
    阿森纳赛季走势: "/arsenal-season",
  };

  router.push(projectRoutes[name] || "/");
};

const handleSkillClick = (skill: string) => {
  const skillLinks: Record<string, string> = {
    "Vue 3": "https://cn.vuejs.org/",
    TypeScript: "https://www.typescriptlang.org/",
    JavaScript: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide",
    "HTML/CSS": "https://web.developers.google.cn/css?hl=zh-cn",
    "Node.js": "https://nodejs.org/zh-cn",
  };

  const url = skillLinks[skill];
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const goToDrag = () => router.push("/drag-box");
const goToProfile = () => router.push("/profile");
const goToChatRoom = () => router.push("/chat-room");
const goToPretextDemo = () => router.push("/pretext-demo");
const goToSoybeanDemo = () => router.push("/soybean-ui-demo");

const handleLogout = () => {
  dialog.warning({
    title: "退出登录",
    content: "确定要退出当前账号吗？",
    positiveText: "确定退出",
    negativeText: "取消",
    draggable: true,
    onPositiveClick: () => {
      authStore.logout();
      message.success("已退出登录");
      router.push("/login");
    },
  });
};

const showUploadBox = () => {
  isShowUploadBox.value = !isShowUploadBox.value;
};

const options = [
  { label: "个人中心", key: "profile" },
  { label: "聊天室", key: "chat-room" },
  { label: "Pretext Demo", key: "pretextDemo" },
  { label: "SoybeanUI Demo", key: "soybean-ui-demo" },
  { label: "退出登录", key: "logout" },
] as const;

const handleSelectOptions = (key: string | number) => {
  const handlers: Record<string, () => void> = {
    profile: goToProfile,
    "chat-room": goToChatRoom,
    pretextDemo: goToPretextDemo,
    "soybean-ui-demo": goToSoybeanDemo,
    logout: handleLogout,
  };

  handlers[String(key)]?.();
};

onMounted(() => {
  if (!typePrinterMaker.value) {
    return;
  }

  typeItInstance = new TypeIt(typePrinterMaker.value, {
    strings: [
      "BUILDING INTERFACES WITH MOTION.",
      "VUE / TYPESCRIPT / DATA VISUALIZATION.",
    ],
    speed: 58,
    waitUntilVisible: true,
    loop: true,
    breakLines: false,
    lifeLike: true,
    nextStringDelay: 1200,
  }).go();
});

onUnmounted(() => {
  typeItInstance?.destroy();
});
</script>

<template>
  <div class="profile-page">
    <div class="ambient-grid" aria-hidden="true"></div>

    <div class="page-shell">
      <ProjectNav tone="warm" :show-default-action="false">
        <template #action>
          <n-dropdown
            placement="bottom-end"
            trigger="click"
            size="medium"
            :options="options"
            @select="handleSelectOptions"
          >
            <button class="profile-btn" type="button">个人中心</button>
          </n-dropdown>
        </template>
      </ProjectNav>

      <header class="hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <div class="hero-status-row">
            <span class="availability"><i></i> Available for ideas</span>
            <span>Shanghai / UTC+8</span>
          </div>

          <p class="hero-kicker">Frontend developer / Creative coder</p>
          <h1 id="home-title" class="hero-title">
            <span>{{ profile.name }}</span>
            <span class="hero-title-outline">Digital Lab</span>
          </h1>

          <div class="hero-intro">
            <p>{{ profile.bio }} 关注动效、数据表达与复杂界面的可用性。</p>
            <div class="type-line">
              <span ref="typePrinterMaker" class="type-printer"></span>
            </div>
          </div>

          <div class="hero-actions">
            <button
              class="command-button command-button--primary"
              type="button"
              @click="goToCheckProjectRoute('CS饰品数据')"
            >
              <span>进入 CS 饰品实验室</span>
              <n-icon><ArrowIcon /></n-icon>
            </button>
            <a class="command-button command-button--ghost" href="#selected-work">
              <span>浏览项目</span>
              <n-icon><ArrowIcon /></n-icon>
            </a>
          </div>
        </div>

        <div class="hero-visual" aria-label="个人头像">
          <div class="portrait-index">/ 001</div>
          <div class="portrait-frame">
            <img :src="profile.avatar" :alt="`${profile.name}的头像`" class="portrait" />
            <div class="portrait-scanline" aria-hidden="true"></div>
          </div>
          <div class="portrait-caption">
            <span>Current focus</span>
            <strong>Vue 3 / Motion / Data</strong>
          </div>
        </div>

        <div class="hero-stats" aria-label="作品概览">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </header>

      <main>
        <section class="manifesto-section">
          <span class="section-number">01</span>
          <div class="manifesto-heading">
            <p class="section-kicker">About / System</p>
            <h2>把工程能力和视觉表达<br />放在同一条轨道上。</h2>
          </div>
          <div class="manifesto-copy">
            <p>
              从业务页面、数据仪表盘到交互动效，用可维护的组件结构承载更有辨识度的视觉体验。
            </p>
            <div class="skill-rail" aria-label="技能栈">
              <button
                v-for="skill in profile.skills"
                :key="skill"
                type="button"
                class="skill-link"
                :title="`打开 ${skill} 官方资料`"
                @click="handleSkillClick(skill)"
              >
                {{ skill }}
              </button>
            </div>
          </div>
        </section>

        <section id="selected-work" class="projects-section">
          <div class="section-heading-row">
            <div>
              <p class="section-kicker">Selected work / 2026</p>
              <h2>正在构建的项目</h2>
            </div>
            <p class="section-note">从页面表现到真实数据接口，持续迭代中的前端实验集合。</p>
          </div>

          <div class="projects-grid">
            <article
              v-for="(project, index) in profile.projects"
              :key="project.name"
              class="project-card"
            >
              <div class="project-meta">
                <span>0{{ index + 1 }}</span>
                <span>{{ project.label }}</span>
              </div>
              <div class="project-copy">
                <h3>{{ project.name }}</h3>
                <p>{{ project.description }}</p>
              </div>
              <button
                class="project-link"
                type="button"
                :aria-label="`查看${project.name}`"
                @click="goToCheckProjectRoute(project.name)"
              >
                <span>Open case</span>
                <n-icon><ArrowIcon /></n-icon>
              </button>
            </article>
          </div>
        </section>

        <section class="lab-section">
          <div class="lab-heading">
            <span class="section-number">03</span>
            <div>
              <p class="section-kicker">Playground / Feedback</p>
              <h2>进入交互试验区</h2>
            </div>
          </div>

          <div class="lab-actions">
            <button class="lab-action" type="button" @click="goToDrag">
              <n-icon><MoveIcon /></n-icon>
              <span>
                <small>Interaction 01</small>
                拖拽实验
              </span>
              <n-icon class="action-arrow"><ArrowIcon /></n-icon>
            </button>
            <button
              class="lab-action"
              :class="{ 'lab-action--active': isShowUploadBox }"
              type="button"
              @click="showUploadBox"
            >
              <n-icon><UploadIcon /></n-icon>
              <span>
                <small>Feedback channel</small>
                {{ isShowUploadBox ? "收起建议上传" : "提交改进建议" }}
              </span>
              <n-icon class="action-arrow"><ArrowIcon /></n-icon>
            </button>
          </div>

          <transition name="upload-box-fade">
            <div v-if="isShowUploadBox" class="upload-panel">
              <UploadBox />
            </div>
          </transition>
        </section>
      </main>

      <footer class="page-footer">
        <span>Chonny Lab / Personal Project Center</span>
        <span>Vue 3 + TypeScript</span>
      </footer>
    </div>

    <n-back-top :right="32" />
  </div>
</template>

<style scoped lang="scss">
.profile-page {
  --ink: #fff8ee;
  --muted: rgba(255, 235, 218, 0.66);
  --line: rgba(255, 212, 174, 0.2);
  --amber: #ffb45f;
  --coral: #ff6b59;
  --rose: #dd416c;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--ink);
  font-family: "Lato", "Microsoft YaHei", sans-serif;
  background:
    linear-gradient(118deg, rgba(255, 139, 75, 0.1) 0%, transparent 28%),
    linear-gradient(300deg, rgba(205, 49, 90, 0.12) 0%, transparent 34%),
    linear-gradient(145deg, #160b0f 0%, #291014 42%, #471d19 74%, #1a0c12 100%);
}

.profile-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background-image:
    linear-gradient(rgba(255, 222, 192, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 222, 192, 0.045) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, #000 0%, transparent 82%);
}

.profile-page::after {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(105deg, transparent 0 58%, rgba(255, 180, 95, 0.05) 58.1% 58.3%, transparent 58.4%),
    repeating-linear-gradient(115deg, transparent 0 96px, rgba(255, 255, 255, 0.018) 97px 98px);
}

.ambient-grid {
  position: fixed;
  top: 16%;
  right: -12%;
  z-index: 0;
  width: 56vw;
  height: 56vw;
  pointer-events: none;
  border: 1px solid rgba(255, 180, 95, 0.08);
  transform: rotate(18deg);
  background: repeating-linear-gradient(90deg, transparent 0 72px, rgba(255, 160, 94, 0.028) 73px 74px);
}

.page-shell {
  position: relative;
  z-index: 1;
  width: min(1480px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0 36px;
}

.profile-btn {
  min-height: 42px;
  padding: 0 1.1rem;
  color: #211014;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  border: 1px solid rgba(255, 231, 207, 0.7);
  border-radius: 4px;
  background: linear-gradient(135deg, #ffd19c, #ff765f);
  box-shadow: 0 10px 32px rgba(255, 103, 77, 0.2);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.profile-btn:hover {
  box-shadow: 0 14px 38px rgba(255, 103, 77, 0.3);
  transform: translateY(-2px);
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(360px, 0.88fr);
  grid-template-rows: 1fr auto;
  height: calc(100svh - 150px);
  min-height: 540px;
  max-height: 660px;
  margin-top: 20px;
  overflow: hidden;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.hero::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 62%;
  width: 1px;
  content: "";
  background: linear-gradient(to bottom, transparent, rgba(255, 199, 153, 0.34), transparent);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 28px 44px 28px 16px;
  animation: copyReveal 700ms ease both;
}

.hero-status-row,
.project-meta,
.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.hero-status-row {
  max-width: 620px;
  margin-bottom: 1.4rem;
}

.availability {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
}

.availability i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a7ef9d;
  box-shadow: 0 0 14px rgba(167, 239, 157, 0.8);
  animation: statusPulse 2s ease-in-out infinite;
}

.hero-kicker,
.section-kicker {
  margin: 0 0 0.8rem;
  color: var(--amber);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.hero-title {
  display: grid;
  margin: 0;
  color: var(--ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 5.8rem;
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: 0;
}

.hero-title-outline {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 217, 183, 0.52);
  white-space: nowrap;
}

.hero-intro {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(280px, 1.2fr);
  gap: 2rem;
  align-items: end;
  max-width: 760px;
  margin-top: 1.25rem;
}

.hero-intro p {
  margin: 0;
  color: var(--muted);
  font-size: 0.98rem;
  line-height: 1.8;
}

.type-line {
  min-width: 0;
  min-height: 52px;
  padding: 0.85rem 0;
  color: #ffd4ad;
  font-family: "Fira Code", monospace;
  font-size: 0.78rem;
  line-height: 1.6;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.type-printer {
  overflow-wrap: anywhere;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.2rem;
}

.command-button {
  display: inline-flex;
  gap: 1.4rem;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 1.2rem;
  color: var(--ink);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
  border-radius: 3px;
  transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.command-button .n-icon,
.project-link .n-icon,
.action-arrow {
  transform: rotate(-35deg);
  transition: transform 180ms ease;
}

.command-button:hover .n-icon,
.project-link:hover .n-icon,
.lab-action:hover .action-arrow {
  transform: rotate(0deg) translateX(3px);
}

.command-button--primary {
  color: #231014;
  border: 1px solid #ffbc79;
  background: linear-gradient(120deg, #ffc17f, #ff765f);
}

.command-button--ghost {
  border: 1px solid var(--line);
  background: rgba(255, 246, 237, 0.035);
}

.command-button:hover {
  border-color: rgba(255, 215, 180, 0.64);
  transform: translateY(-2px);
}

.hero-visual {
  position: relative;
  display: grid;
  align-content: center;
  justify-items: center;
  min-width: 0;
  padding: 24px 20px 24px 56px;
  animation: visualReveal 900ms 100ms ease both;
}

.portrait-index {
  position: absolute;
  top: 24px;
  right: 18px;
  color: rgba(255, 221, 191, 0.46);
  font-family: "Fira Code", monospace;
  font-size: 0.78rem;
}

.portrait-frame {
  position: relative;
  width: min(350px, 82%);
  aspect-ratio: 4 / 5;
  overflow: hidden;
  clip-path: polygon(12% 0, 100% 0, 100% 86%, 86% 100%, 0 100%, 0 12%);
  background: #331519;
  box-shadow: 34px 34px 0 rgba(255, 112, 81, 0.07);
}

.portrait-frame::before {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(to top, rgba(38, 10, 15, 0.64), transparent 50%),
    linear-gradient(130deg, rgba(255, 174, 99, 0.18), transparent 46%);
  mix-blend-mode: color;
}

.portrait {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.78) contrast(1.08) sepia(0.12);
  transform: scale(1.02);
}

.portrait-scanline {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, transparent 0 5px, rgba(255, 244, 233, 0.035) 6px);
}

.portrait-caption {
  display: grid;
  gap: 0.25rem;
  width: min(350px, 82%);
  padding: 1rem 0 0;
  border-top: 1px solid var(--line);
}

.portrait-caption span {
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.portrait-caption strong {
  font-size: 0.9rem;
}

.hero-stats {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--line);
}

.stat-item {
  display: flex;
  gap: 1rem;
  align-items: baseline;
  padding: 1rem 1.2rem;
}

.stat-item + .stat-item {
  border-left: 1px solid var(--line);
}

.stat-item strong {
  color: var(--coral);
  font-family: Georgia, serif;
  font-size: 1.8rem;
}

.stat-item span {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.manifesto-section {
  display: grid;
  grid-template-columns: 80px minmax(360px, 1.1fr) minmax(320px, 0.9fr);
  gap: 3rem;
  padding: 7rem 1rem;
  border-bottom: 1px solid var(--line);
}

.section-number {
  color: rgba(255, 215, 181, 0.42);
  font-family: "Fira Code", monospace;
  font-size: 0.82rem;
}

.manifesto-heading h2,
.section-heading-row h2,
.lab-heading h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 600;
  letter-spacing: 0;
}

.manifesto-heading h2 {
  font-size: 3.7rem;
  line-height: 1.08;
}

.manifesto-copy {
  align-self: end;
}

.manifesto-copy > p,
.section-note {
  margin: 0;
  color: var(--muted);
  line-height: 1.9;
}

.skill-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 2rem;
}

.skill-link {
  padding: 0.55rem 0.75rem;
  color: rgba(255, 241, 227, 0.84);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid var(--line);
  border-radius: 2px;
  background: transparent;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.skill-link:hover {
  color: #2a1115;
  border-color: var(--amber);
  background: var(--amber);
}

.projects-section {
  padding: 7rem 1rem;
  scroll-margin-top: 110px;
}

.section-heading-row {
  display: flex;
  gap: 3rem;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 2.4rem;
}

.section-heading-row h2,
.lab-heading h2 {
  font-size: 3.4rem;
}

.section-note {
  max-width: 440px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}

.project-card {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-width: 0;
  min-height: 300px;
  padding: 1.5rem;
  overflow: hidden;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: rgba(255, 242, 231, 0.025);
  transition: background-color 220ms ease, transform 220ms ease;
}

.project-card::before {
  position: absolute;
  top: 0;
  right: 0;
  width: 34%;
  height: 3px;
  content: "";
  background: var(--amber);
  transform: scaleX(0.2);
  transform-origin: right;
  transition: transform 220ms ease;
}

.project-card:nth-child(2)::before { background: var(--coral); }
.project-card:nth-child(3)::before { background: var(--rose); }
.project-card:nth-child(4)::before { background: #72d8cf; }

.project-card:hover {
  z-index: 1;
  background: rgba(255, 156, 108, 0.07);
  transform: translateY(-5px);
}

.project-card:hover::before {
  transform: scaleX(1);
}

.project-meta {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
}

.project-copy {
  align-self: center;
  padding: 2rem 0;
}

.project-copy h3 {
  margin: 0 0 0.8rem;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2.5rem;
  font-weight: 600;
}

.project-copy p {
  max-width: 420px;
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}

.project-link {
  display: inline-flex;
  gap: 1rem;
  align-items: center;
  justify-self: start;
  padding: 0;
  color: var(--ink);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  border: 0;
  background: transparent;
}

.lab-section {
  display: grid;
  grid-template-columns: minmax(300px, 0.8fr) minmax(520px, 1.2fr);
  gap: 4rem;
  padding: 5rem 1rem;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: linear-gradient(100deg, rgba(255, 173, 95, 0.06), rgba(207, 55, 91, 0.05));
}

.lab-heading {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 1.2rem;
}

.lab-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}

.lab-action {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  min-height: 120px;
  padding: 1.2rem;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  border: 0;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: rgba(255, 248, 240, 0.025);
  transition: background-color 180ms ease;
}

.lab-action:hover,
.lab-action--active {
  background: rgba(255, 140, 92, 0.12);
}

.lab-action > .n-icon:first-child {
  color: var(--amber);
  font-size: 1.4rem;
}

.lab-action span {
  display: grid;
  gap: 0.32rem;
  font-weight: 800;
}

.lab-action small {
  color: var(--muted);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.upload-panel {
  grid-column: 1 / -1;
  padding-top: 2rem;
}

.upload-box-fade-enter-active,
.upload-box-fade-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}

.upload-box-fade-enter-from,
.upload-box-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.page-footer {
  padding: 1.4rem 1rem 0;
}

@keyframes copyReveal {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes visualReveal {
  from { opacity: 0; clip-path: inset(0 0 100% 0); }
  to { opacity: 1; clip-path: inset(0); }
}

@keyframes statusPulse {
  50% { opacity: 0.45; transform: scale(0.8); }
}

@media (max-width: 1120px) {
  .hero-title { font-size: 5.4rem; }
  .hero-intro { grid-template-columns: 1fr; gap: 1rem; }
  .manifesto-section { grid-template-columns: 52px 1fr; }
  .manifesto-copy { grid-column: 2; }
  .lab-section { grid-template-columns: 1fr; }
}

@media (max-width: 820px) {
  .page-shell { width: min(100% - 28px, 1480px); padding-top: 14px; }
  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero::before { display: none; }
  .hero-copy { padding: 4rem 0.4rem 2.5rem; }
  .hero-visual { padding: 1rem 0.4rem 3rem; }
  .portrait-frame,
  .portrait-caption { width: min(500px, 100%); }
  .hero-stats { grid-template-columns: 1fr; }
  .stat-item + .stat-item { border-top: 1px solid var(--line); border-left: 0; }
  .manifesto-section { padding: 5rem 0.4rem; }
  .manifesto-heading h2,
  .section-heading-row h2,
  .lab-heading h2 { font-size: 2.8rem; }
  .projects-section { padding: 5rem 0.4rem; }
  .projects-grid { grid-template-columns: 1fr; }
  .lab-section { padding: 4rem 0.4rem; }
}

@media (max-width: 560px) {
  .profile-btn { min-height: 38px; padding: 0 0.8rem; font-size: 0.82rem; }
  .hero-status-row { align-items: flex-start; flex-direction: column; gap: 0.5rem; }
  .hero-title { font-size: 3.65rem; }
  .hero-intro { margin-top: 1.6rem; }
  .hero-actions { flex-direction: column; }
  .command-button { width: 100%; }
  .manifesto-section { grid-template-columns: 1fr; gap: 1.5rem; }
  .manifesto-copy { grid-column: auto; }
  .manifesto-heading h2,
  .section-heading-row h2,
  .lab-heading h2 { font-size: 2.2rem; }
  .section-heading-row { align-items: flex-start; flex-direction: column; }
  .project-card { min-height: 270px; padding: 1.2rem; }
  .project-copy h3 { font-size: 2rem; }
  .lab-heading { grid-template-columns: 36px 1fr; }
  .lab-actions { grid-template-columns: 1fr; }
  .page-footer { align-items: flex-start; flex-direction: column; gap: 0.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
