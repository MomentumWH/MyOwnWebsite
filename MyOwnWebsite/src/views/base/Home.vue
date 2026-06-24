<script setup lang="ts">
import ProjectNav from "@/components/projectNav/index.vue";
import UploadBox from "@/components/uploadByNaviUI/index.vue";
import { useDialog, useMessage } from "naive-ui";
import { markRaw, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { CashOutline as CashIcon } from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import TypeIt from "typeit";

const message = useMessage();
const dialog = useDialog();
const authStore = useAuthStore();
const typePrinterMaker = ref<HTMLElement | null>(null);
const profile = markRaw({
  name: "张三",
  title: "前端开发工程师",
  avatar:
    "https://pic.youpinimg.com/prod/client_dir/R6F03F696DB344057BCD5B68E6ABD2637.webp?x-oss-process=image/format,webp/quality,Q_100",
  bio: "热爱编程，专注于前端技术，擅长 Vue、React 等框架。",
  skills: ["Vue 3", "TypeScript", "JavaScript", "HTML/CSS", "Node.js"],
  projects: [
    { name: "个人博客", description: "使用 Vue 3 和 Vite 构建的个人博客系统" },
    { name: "电商平台", description: "基于 Nuxt 3 的电商平台项目" },
    { name: "数据可视化", description: "使用 ECharts 实现的数据分析平台" },
    { name: "CS饰品数据", description: "CS饰品行情数据展示和分析平台" },
  ],
});

const skillsRendered = ref(false);
const MAX_SNOWFLAKES = 50;
const SKILLS_RENDER_DELAY = 2000;
let skillsTimer: ReturnType<typeof setTimeout> | null = null;
let typeItInstance: TypeIt | null = null;

// 技能栈渲染完成后显示项目经验
onMounted(() => {

  skillsTimer = setTimeout(() => {
    skillsRendered.value = true;
  }, SKILLS_RENDER_DELAY); // 2秒后显示项目经验
});

// 获取项目路由
const router = useRouter();

const goToCheckProjectRoute = (name: string) => {
  switch (name) {
    case "个人博客":
      router.push("/blog");
      break;
    case "电商平台":
      router.push("/ecommerce");
      break;
    case "数据可视化":
      router.push("/data-visualization");
      break;
    case "CS饰品数据":
      router.push("/cs-items");
      break;
    default:
      router.push("/");
  }
};

// 雪花特效
interface Snowflake {
  id: number;
  x: number;
  size: number;
  opacity: number;
  drift: number;
  duration: number;
  delay: number;
}

const createSnowflake = (index: number): Snowflake => ({
  id: index,
  x: Math.random() * 100,
  size: Math.random() * 8 + 4,
  opacity: Math.random() * 0.45 + 0.35,
  drift: Math.random() * 80 - 40,
  duration: Math.random() * 10 + 12,
  delay: Math.random() * -18,
});

const snowflakes = markRaw(Array.from({ length: MAX_SNOWFLAKES }, (_, index) => createSnowflake(index)));
const handleConfirm = (value: string) => {
  dialog.warning({
    title: "Tips",
    content: "你确定要跳转到对应技术栈介绍页面吗？",
    positiveText: "确定",
    negativeText: "不确定",
    draggable: true,
    onPositiveClick: () => {
      //message.success('确定')
      handleSkillClick(value);
    },
    onNegativeClick: () => {
      message.warning("取消跳转");
    },
  });
};
const handleSkillClick = (skill: string) => {
  switch (skill) {
    case "Vue 3":
      window.open("https://cn.vuejs.org/", "_blank");
      break;
    case "TypeScript":
      window.open("https://www.typescriptlang.org/", "_blank");
      break;
    case "JavaScript":
      window.open(
        "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide",
        "_blank",
      );
      break;
    case "HTML/CSS":
      window.open("https://web.developers.google.cn/css?hl=zh-cn", "_blank");
      break;
    case "Node.js":
      window.open("https://nodejs.org/zh-cn", "_blank");
      break;
    default:
      router.push("/");
  }
};

const goToDrag = () => {
  router.push("/drag-box");
};

const goToProfile = () => {
  router.push("/profile");
};

const goToChatRoom = () => {
  router.push("/chat-room");
};

const goToPretextDemo = () => {
  router.push("/pretext-demo");
};

const goToSoybeanDemo = () => {
  router.push("/soybean-ui-demo");
};

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
onMounted(() => {
  if (typePrinterMaker.value) {
    typeItInstance = new TypeIt(typePrinterMaker.value, {
      strings: [
        "Welcome  to  SoyBean   Introduction !",
        "This is the first Admin  powered by  Chonny !",
      ],
      speed: 100,
      waitUntilVisible: true,
      loop: true,
      breakLines: true, // 是否允许换行
      lifeLike: true,
      nextStringDelay: 1000,
    }).go();
  }
});
const isShowUploadBox = ref(false);
const showUploadBox = () => {
  isShowUploadBox.value = !isShowUploadBox.value;
};
const options = ref([
  {
    label: "个人中心",
    key: "profile",
  },
  {
    label: "聊天室",
    key: "chat-room",
  },
  {
    label: "pretextDemo",
    key: "pretextDemo",
  },
  {
    label: "SoybeanUI Demo",
    key: "soybean-ui-demo",
  },
  {
    label: "退出登录",
    key: "logout",
  },
]);
const handleSelectOptions = (key: string | number) => {
  switch (key) {
    case "profile":
      goToProfile();
      break;
    case "chat-room":
      goToChatRoom();
      break;
    case "pretextDemo":
      goToPretextDemo();
      break;
    case "soybean-ui-demo":
      goToSoybeanDemo();
      break;
    case "logout":
      handleLogout();
      break;
    default:
      break;
  }
};
onUnmounted(() => {
  if (skillsTimer) {
    clearTimeout(skillsTimer);
  }
  typeItInstance?.destroy();
});
</script>
<template>
  <div class="profile-page">
    <div class="snow-container">
      <div
        v-for="snowflake in snowflakes"
        :key="snowflake.id"
        class="snowflake"
        :style="{
          left: `${snowflake.x}%`,
          width: `${snowflake.size}px`,
          height: `${snowflake.size}px`,
          opacity: snowflake.opacity,
          '--snow-drift': `${snowflake.drift}px`,
          '--snow-duration': `${snowflake.duration}s`,
          '--snow-delay': `${snowflake.delay}s`,
        }"
      ></div>
    </div>

    <div class="page-shell">
      <ProjectNav :show-default-action="false">
        <template #action>
          <n-dropdown
            placement="bottom-start"
            trigger="click"
            size="medium"
            :options="options"
            @select="handleSelectOptions"
          >
            <button class="profile-btn">个人中心</button>
          </n-dropdown>
        </template>
      </ProjectNav>

      <header class="profile-header">
        <div class="hero-profile-card">
          <img :src="profile.avatar" alt="Avatar" class="avatar" />
          <div class="profile-info">
            <span class="section-kicker">Personal Portal</span>
            <h1 class="name">{{ profile.name }}</h1>
            <p class="title">{{ profile.title }}</p>
          </div>
        </div>

        <div class="hero-intro-card">
          <span class="section-kicker">Live Intro</span>
          <div class="titleTypePrintBox">
            <span
              ref="typePrinterMaker"
              class="typePrinterTitleLike"
              :style="{ color: '#FFF' }"
            ></span>
          </div>
          <p class="hero-support-text">
            聚合个人简介、技能栈、项目入口与建议上传，让访问路径更清晰。
          </p>
        </div>
      </header>

      <main class="content-layout">
        <section class="bio-section content-card">
          <span class="section-kicker">About Me</span>
          <h2>个人简介</h2>
          <p class="bio">{{ profile.bio }}</p>
        </section>

        <section class="skills-section content-card">
          <div class="section-heading-row">
            <div>
              <span class="section-kicker">Tech Stack</span>
              <h2>技能栈</h2>
            </div>
            <span class="section-count">{{ profile.skills.length }} 项能力</span>
          </div>
          <div class="skills-grid">
            <TransitionGroup
              name="skill-fade"
              tag="div"
              class="skills-transition-group"
            >
              <div
                v-for="(skill, index) in profile.skills"
                :key="skill"
                class="skill-tag"
                :style="{ animationDelay: `${index * 0.1}s` }"
                @click="handleConfirm(skill)"
              >
                {{ skill }}
              </div>
            </TransitionGroup>
          </div>
        </section>
      </main>

      <section v-if="skillsRendered" class="projects-section content-card">
        <div class="section-heading-row">
          <div>
            <span class="section-kicker">Selected Work</span>
            <h2>项目经验</h2>
          </div>
          <span class="section-count">{{ profile.projects.length }} 个项目</span>
        </div>
        <div class="projects-list">
          <TransitionGroup
            name="project-fade"
            tag="div"
            class="projects-transition-group"
          >
            <div
              v-for="(project, index) in profile.projects"
              :key="project.name"
              class="project-card"
              :style="{ animationDelay: `${index * 0.2}s` }"
            >
              <h3>{{ project.name }}</h3>
              <p>{{ project.description }}</p>
              <button
                class="project-link"
                @click="goToCheckProjectRoute(project.name)"
              >
                查看详情
              </button>
            </div>
          </TransitionGroup>
        </div>
      </section>

      <section v-if="skillsRendered" class="action-section content-card">
        <div class="action-copy">
          <span class="section-kicker">Playground & Feedback</span>
          <h2>互动体验</h2>
          <p>尝试拖拽 Demo，或上传建议帮助网站持续优化。</p>
        </div>
        <div class="dragBox">
          <div class="dragButtonBox">
            <n-button class="tech-action-button" @click="goToDrag">
              <template #icon>
                <n-icon>
                  <CashIcon />
                </n-icon>
              </template>
              This is drag button demo
            </n-button>
          </div>
          <div
            class="upload-suggestion-banner"
            :class="{ 'upload-suggestion-banner--open': isShowUploadBox }"
            @click="showUploadBox"
          >
            <n-gradient-text
              gradient="linear-gradient(90deg, #c7f6ff 0%, #5fe7ff 38%, #b994ff 76%, #f3f7ff 100%)"
            >
              如果您对本网站有什么更好的建议的话，欢迎在下方上传您的宝贵建议哦！！！{{
                isShowUploadBox ? "(再次点击收起上传)" : ""
              }}
            </n-gradient-text>
          </div>
          <transition name="upload-box-fade">
            <UploadBox v-if="isShowUploadBox"></UploadBox>
          </transition>
        </div>
      </section>
    </div>

    <n-back-top :right="100" />
  </div>
</template>
<style scoped lang="scss">
.profile-page {
  position: relative;
  min-width: 1200px;
  min-height: 100vh;
  padding: 2rem 4rem 4rem;
  overflow-x: hidden;
  font-family: "Arial", sans-serif;
  background:
    radial-gradient(circle at 12% 18%, rgba(0, 224, 255, 0.34), transparent 28%),
    radial-gradient(circle at 88% 12%, rgba(165, 92, 255, 0.42), transparent 30%),
    radial-gradient(circle at 50% 88%, rgba(73, 108, 255, 0.34), transparent 36%),
    linear-gradient(135deg, #050816 0%, #0b1741 42%, #31105f 72%, #14091f 100%);
  background-attachment: fixed;
}

.profile-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background-image:
    linear-gradient(rgba(102, 220, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 220, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.85), transparent 88%);
}

.profile-page::after {
  position: fixed;
  inset: -20%;
  z-index: 0;
  pointer-events: none;
  content: "";
  background:
    conic-gradient(from 120deg at 30% 50%, transparent, rgba(0, 238, 255, 0.18), transparent 28%),
    conic-gradient(from 280deg at 72% 48%, transparent, rgba(177, 91, 255, 0.2), transparent 30%);
  filter: blur(18px);
  animation: auroraFloat 16s ease-in-out infinite alternate;
}

.page-shell {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.5rem;
  width: min(1480px, 100%);
  margin: 0 auto;
}


.profile-header,
.content-card {
  contain: layout paint;
  border: 1px solid rgba(136, 220, 255, 0.24);
  box-shadow:
    0 24px 80px rgba(3, 9, 34, 0.36),
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    0 0 36px rgba(94, 178, 255, 0.14);
  backdrop-filter: blur(18px);
}

.profile-header {
  display: grid;
  grid-template-columns: minmax(380px, 0.9fr) minmax(520px, 1.1fr);
  gap: 1.5rem;
  align-items: stretch;
  height: 330px;
  padding: 1.5rem;
  color: white;
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(22, 42, 92, 0.72) 0%, rgba(74, 32, 128, 0.7) 100%),
    linear-gradient(90deg, rgba(0, 238, 255, 0.2), rgba(174, 94, 255, 0.22));
}

.hero-profile-card,
.hero-intro-card,
.content-card {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  background: linear-gradient(135deg, rgba(9, 24, 58, 0.58), rgba(44, 25, 88, 0.5));
  border-radius: 22px;
}

.hero-profile-card,
.hero-intro-card {
  display: flex;
  align-items: center;
  height: 100%;
  min-height: 0;
  padding: 2rem;
  border: 1px solid rgba(138, 220, 255, 0.18);
}

.hero-profile-card {
  gap: 2.5rem;
  padding: 2.4rem;
}

.hero-intro-card {
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
}

.hero-intro-card::after,
.content-card::after {
  position: absolute;
  inset: auto -18% -45% 32%;
  height: 150px;
  pointer-events: none;
  content: "";
  background: radial-gradient(circle, rgba(0, 217, 255, 0.16), transparent 66%);
}

.avatar {
  flex: 0 0 auto;
  width: 178px;
  height: 178px;
  object-fit: cover;
  border: 4px solid rgba(196, 244, 255, 0.85);
  border-radius: 50%;
  box-shadow:
    0 0 0 8px rgba(82, 211, 255, 0.1),
    0 0 30px rgba(0, 238, 255, 0.48),
    0 18px 45px rgba(0, 0, 0, 0.28);
}

.profile-info {
  min-width: 0;
}

.section-kicker {
  display: inline-flex;
  margin-bottom: 0.65rem;
  color: #6ff0ff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-shadow: 0 0 16px rgba(0, 238, 255, 0.46);
}

.name {
  margin: 0;
  color: #f7fbff;
  font-size: clamp(3rem, 4.8vw, 5.4rem);
  font-weight: 800;
  line-height: 1;
}

.title {
  margin: 0.9rem 0 0;
  color: rgba(237, 247, 255, 0.78);
  font-size: 1.38rem;
  font-weight: 700;
}

.titleTypePrintBox {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 82px;
}

.typePrinterTitleLike {
  font-family: "Times New Roman", Times, serif;
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: clamp(1.75rem, 2.8vw, 3rem);
  font-weight: bold;
  line-height: 1.12;
  text-shadow: 0 0 24px rgba(172, 128, 255, 0.36);
}

.hero-support-text {
  max-width: 620px;
  margin: 0.75rem 0 0;
  color: rgba(237, 247, 255, 0.7);
  font-size: 1rem;
  line-height: 1.8;
}

.content-layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.85fr) minmax(560px, 1.15fr);
  gap: 1.5rem;
  align-items: stretch;
}

.content-card {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(9, 24, 58, 0.68), rgba(44, 25, 88, 0.58));
}

.bio-section,
.skills-section,
.projects-section,
.action-section {
  min-height: 100%;
}

.bio-section h2,
.skills-section h2,
.projects-section h2,
.action-copy h2 {
  margin: 0;
  color: #c7f6ff;
  font-size: 1.75rem;
  text-shadow: 0 0 18px rgba(0, 238, 255, 0.42);
}

.bio {
  margin: 1.25rem 0 0;
  color: rgba(237, 247, 255, 0.86);
  font-size: 1.08rem;
  line-height: 1.9;
}

.section-heading-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-count {
  flex: 0 0 auto;
  padding: 0.42rem 0.8rem;
  color: #dffaff;
  font-size: 0.88rem;
  font-weight: 700;
  border: 1px solid rgba(138, 220, 255, 0.22);
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.08);
}

.skills-grid,
.skills-transition-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 0.9rem;
}

.skill-tag {
  padding: 1.05rem 1.25rem;
  color: white;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  border: 1px solid rgba(203, 246, 255, 0.36);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(0, 194, 255, 0.78) 0%, rgba(132, 78, 255, 0.86) 100%);
  box-shadow:
    0 10px 26px rgba(38, 109, 255, 0.24),
    0 0 22px rgba(0, 238, 255, 0.16);
  opacity: 0;
  animation: skillFlyIn 2s ease forwards;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.skill-tag:hover {
  transform: translateY(-4px);
  box-shadow:
    0 16px 34px rgba(38, 109, 255, 0.3),
    0 0 28px rgba(0, 238, 255, 0.22);
}

.projects-list {
  width: 100%;
}

.projects-transition-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.15rem;
  width: 100%;
}

.project-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 210px;
  padding: 1.5rem;
  border: 1px solid rgba(138, 220, 255, 0.22);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(12, 31, 72, 0.78) 0%, rgba(53, 27, 101, 0.72) 100%);
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  opacity: 0;
  backdrop-filter: blur(16px);
  animation: projectFadeIn 1.5s ease forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.project-card:hover {
  border-color: rgba(122, 232, 255, 0.48);
  box-shadow:
    0 26px 70px rgba(0, 0, 0, 0.34),
    0 0 38px rgba(0, 238, 255, 0.24);
  transform: translateY(-8px);
}

.project-card h3 {
  margin: 0 0 0.65rem;
  color: #f4fbff;
  font-size: 1.2rem;
  line-height: 1.35;
  word-break: keep-all;
}

.project-card p {
  flex: 1;
  margin: 0 0 1.25rem;
  color: rgba(229, 241, 255, 0.78);
  font-size: 0.94rem;
  line-height: 1.7;
  word-break: normal;
}

.project-link {
  align-self: flex-start;
  display: inline-flex;
  padding: 0.55rem 1rem;
  color: white;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid rgba(214, 250, 255, 0.36);
  border-radius: 10px;
  background: linear-gradient(135deg, #00d9ff 0%, #8f5cff 100%);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-link:hover {
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.34);
  transform: translateY(-2px);
}

.action-section {
  display: grid;
  grid-template-columns: minmax(280px, 0.42fr) minmax(560px, 1fr);
  gap: 1.5rem;
  align-items: center;
}

.action-copy p {
  margin: 1rem 0 0;
  color: rgba(237, 247, 255, 0.74);
  line-height: 1.8;
}

.dragBox {
  display: grid;
  gap: 1rem;
  width: 100%;
}

.dragButtonBox {
  display: flex;
  justify-content: flex-start;
}

.tech-action-button {
  --n-color: linear-gradient(135deg, rgba(0, 217, 255, 0.82), rgba(126, 92, 255, 0.88)) !important;
  --n-color-hover: linear-gradient(135deg, rgba(47, 233, 255, 0.94), rgba(165, 119, 255, 0.96)) !important;
  --n-color-pressed: linear-gradient(135deg, rgba(0, 171, 224, 0.94), rgba(95, 65, 224, 0.96)) !important;
  --n-border: 1px solid rgba(202, 247, 255, 0.42) !important;
  --n-border-hover: 1px solid rgba(202, 247, 255, 0.72) !important;
  --n-border-pressed: 1px solid rgba(171, 224, 255, 0.58) !important;
  --n-text-color: #f4fbff !important;
  --n-text-color-hover: #ffffff !important;
  --n-text-color-pressed: #ffffff !important;
  --n-ripple-color: rgba(95, 231, 255, 0.38) !important;
  box-shadow:
    0 12px 32px rgba(0, 217, 255, 0.22),
    0 0 22px rgba(143, 92, 255, 0.22);
  backdrop-filter: blur(14px);
}

.upload-suggestion-banner {
  padding: 0.95rem 1.35rem;
  color: aliceblue;
  font-family:
    "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  font-size: 17px;
  text-align: center;
  cursor: pointer;
  border: 1px solid rgba(176, 232, 255, 0.28);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(0, 194, 255, 0.22) 0%, rgba(91, 100, 255, 0.34) 48%, rgba(143, 92, 255, 0.4) 100%);
  box-shadow:
    0 14px 38px rgba(28, 94, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(16px);
  transition: transform 0.3s ease, border-color 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease;
}

.upload-suggestion-banner--open {
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.28) 0%, rgba(143, 92, 255, 0.48) 100%);
  box-shadow:
    0 18px 48px rgba(0, 217, 255, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.upload-suggestion-banner:hover {
  border-color: rgba(202, 247, 255, 0.52);
  filter: brightness(1.08);
  transform: translateY(-2px);
}

.profile-btn,
.chat-btn {
  padding: 0.75rem 1.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(215, 250, 255, 0.38);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.9) 0%, rgba(143, 92, 255, 0.92) 100%);
  box-shadow: 0 10px 28px rgba(0, 217, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-btn:hover,
.chat-btn:hover {
  box-shadow: 0 10px 28px rgba(0, 217, 255, 0.34);
  transform: translateY(-2px);
}

.snow-container {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.snowflake {
  position: absolute;
  top: -24px;
  background: #e8fbff;
  border-radius: 50%;
  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 18px rgba(0, 238, 255, 0.55);
  will-change: transform;
  animation: snowfall var(--snow-duration) linear var(--snow-delay) infinite;
}

.upload-box-fade-enter-active,
.upload-box-fade-leave-active {
  transition: all 0.5s ease;
}

.upload-box-fade-enter-from,
.upload-box-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes skillFlyIn {
  0% {
    opacity: 0;
    transform: translateX(-100px) rotate(0deg);
  }
  50% {
    transform: translateX(10px) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }
}

@keyframes projectFadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes auroraFloat {
  0% {
    transform: translate3d(-2%, -1%, 0) rotate(0deg) scale(1);
  }
  100% {
    transform: translate3d(2%, 1%, 0) rotate(8deg) scale(1.08);
  }
}

@keyframes snowfall {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(var(--snow-drift), 110vh, 0) rotate(360deg);
  }
}

@media (max-width: 1280px) {
  .profile-page {
    min-width: 0;
    padding: 1.5rem;
  }

  .profile-header,
  .content-layout,
  .action-section {
    grid-template-columns: 1fr;
  }

  .profile-header {
    height: auto;
  }

  .hero-profile-card,
  .hero-intro-card {
    min-height: 260px;
  }

  .projects-transition-group {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .profile-page {
    padding: 1rem;
  }


  .hero-profile-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hero-profile-card,
  .hero-intro-card,
  .content-card {
    padding: 1.25rem;
  }

  .avatar {
    width: 140px;
    height: 140px;
  }

  .name {
    font-size: 3rem;
  }

  .title {
    font-size: 1.15rem;
  }

  .projects-transition-group,
  .skills-grid,
  .skills-transition-group {
    grid-template-columns: 1fr;
  }

  .section-heading-row {
    flex-direction: column;
  }

  .typePrinterTitleLike {
    font-size: 1.65rem;
  }
}
</style>






