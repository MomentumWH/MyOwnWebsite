<script setup lang="ts">
import UploadBox from "@/components/uploadByNaviUI/index.vue";
import { useDialog, useMessage } from "naive-ui";
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { CashOutline as CashIcon } from "@vicons/ionicons5";
import { useAuthStore } from "../stores/auth";
const message = useMessage();
const dialog = useDialog();
const authStore = useAuthStore();
import TypeIt from "typeit";
const typePrinterMaker = ref(null);
const profile = ref({
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
  ],
});

const skillsRendered = ref(false);

// 技能栈渲染完成后显示项目经验
onMounted(() => {
  setTimeout(() => {
    skillsRendered.value = true;
  }, 2000); // 2秒后显示项目经验
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
    default:
      router.push("/");
  }
};

// 雪花特效
interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

const snowflakes = ref<Snowflake[]>([]);

const createSnowflake = () => {
  return {
    id: Math.random(),
    x: Math.random() * window.innerWidth,
    y: -50,
    size: Math.random() * 10 + 5,
    speed: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.5,
  };
};

const updateSnowflakes = () => {
  snowflakes.value = snowflakes.value.map((snowflake) => {
    return {
      ...snowflake,
      y: snowflake.y + snowflake.speed,
      x: snowflake.x + Math.sin(snowflake.y / 100) * 2,
    };
  });

  // 移除超出屏幕的雪花
  snowflakes.value = snowflakes.value.filter(
    (snowflake) => snowflake.y < window.innerHeight,
  );

  // 添加新雪花
  if (snowflakes.value.length < 50) {
    snowflakes.value.push(createSnowflake());
  }
};

let animationFrameId = 0;
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

onMounted(() => {
  const animate = () => {
    updateSnowflakes();
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
  if (typePrinterMaker.value) {
    new TypeIt(typePrinterMaker.value, {
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
  isShowUploadBox.value = true;
};

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="profile-page">
    <!-- 雪花特效 -->
    <!-- <n-message-provider> -->
    <div class="snow-container">
      <div
        v-for="snowflake in snowflakes"
        :key="snowflake.id"
        class="snowflake"
        :style="{
          left: `${snowflake.x}px`,
          top: `${snowflake.y}px`,
          width: `${snowflake.size}px`,
          height: `${snowflake.size}px`,
          opacity: snowflake.opacity,
        }"
      ></div>
    </div>

    <header class="profile-header">
      <!-- <div  class="headerSimplification"> -->
      <!-- <div> -->
      <img :src="profile.avatar" alt="Avatar" class="avatar" />
      <div class="profile-info">
        <h1 class="name">{{ profile.name }}</h1>
        <p class="title">{{ profile.title }}</p>
      </div>
      <!-- </div>   -->
      <div class="titleTypePrintBox">
        <span
          ref="typePrinterMaker"
          class="typePrinterTitleLike"
          :style="{ color: '#FFF' }"
        ></span>
      </div>
      <div class="header-buttons">
        <button @click="goToProfile" class="profile-btn">个人中心</button>
        <button
          v-if="authStore.canAccessChatRoom"
          @click="goToChatRoom"
          class="chat-btn"
        >
          聊天室
        </button>
      </div>
      <!-- </div> -->
    </header>

    <section class="bio-section">
      <h2>个人简介</h2>
      <p class="bio">{{ profile.bio }}</p>
    </section>

    <section class="skills-section">
      <h2>技能栈</h2>
      <div class="skills-grid">
        <TransitionGroup
          name="skill-fade"
          tag="div"
          class="skills-transition-group"
        >
          <div
            v-for="(skill, index) in profile.skills"
            :key="skill"
            @click="handleConfirm(skill)"
            class="skill-tag"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            {{ skill }}
          </div>
        </TransitionGroup>
      </div>
    </section>

    <section v-if="skillsRendered" class="projects-section">
      <h2>项目经验</h2>
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
              @click="goToCheckProjectRoute(project.name)"
              class="project-link"
            >
              查看详情
            </button>
          </div>
        </TransitionGroup>
      </div>
    </section>

    <setion v-if="skillsRendered">
      <div class="dragBox">
        <!-- <n-button @click="goToDrag" dashed  type="info">This is drag button demo</n-button> -->
        <div class="dragButtonBox">
          <n-button color="#ff69b4" @click="goToDrag">
            <template #icon>
              <n-icon>
                <CashIcon />
              </n-icon>
            </template>
            This is drag button demo
          </n-button>
        </div>
        <div
          style="
              text-align: center;
              flex: 1;
              font-family:
                'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
                'Lucida Sans Unicode;, Geneva, Verdana, sans-serif;
              font-size: 18px;
              margin-top: 24px;
              color: aliceblue;
              margin-bottom: 24px;
              width: 100%;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;"
          @click="showUploadBox"
        >
          如果您对本网站有什么更好的建议的话，欢迎在下方上传您的宝贵建议哦！！！?
        </div>
        <UploadBox v-if="isShowUploadBox"></UploadBox>
      </div>
    </setion>

    <!-- </n-message-provider> -->
    <n-back-top :right="100" />
  </div>
</template>

<style scoped lang="scss">
.profile-page {
  min-width: 1200px;
  margin: 0 auto;
  padding: 2rem 4rem;
  font-family: "Arial", sans-serif;
  background: linear-gradient(135deg, #8aa064 0%, #c55d8d 100%);
  min-height: 100vh;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 5rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}
.headerSimplification {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: space-between;
}
.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-info {
  flex: 1;
}

.name {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
}

.title {
  font-size: 1.25rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.bio-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.bio-section h2 {
  font-size: 1.75rem;
  margin: 0 0 1rem 0;
  color: #333;
}

.bio {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #666;
}

.skills-section {
  margin-bottom: 3rem;
}

.skills-section h2 {
  font-size: 1.75rem;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.skills-transition-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.skill-tag {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  color: white;
  border-radius: 24px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  animation: skillFlyIn 2s ease forwards;
  opacity: 0;
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

.projects-section h2 {
  font-size: 1.75rem;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.projects-transition-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  padding: 2rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(245, 247, 250, 0.95) 100%
  );
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  animation: projectFadeIn 1.5s ease forwards;
  opacity: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  &:hover {
    transform: translateY(-8px) scale(1.5) rotate(30deg);
    box-shadow: 60px 30px 60px rgba(189, 37, 37, 0.2);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(245, 247, 250, 0.98) 100%
    );
    border-color: rgba(102, 126, 234, 0.3);
  }
}

/* .project-card:hover {

} */

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

.project-card h3 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.project-card p {
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  color: #666;
}

.project-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.project-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 雪花特效样式 */
.snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.snowflake {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  animation: snowfall linear infinite;
}

@keyframes snowfall {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}
.dragBox {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 100px;
}
.titleTypePrintBox {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 100px;
}
.typePrinterTitleLike {
  font-weight: bold;
  font-size: 42px;
  font-family: "Times New Roman", Times, serif;
}

.header-buttons {
  display: flex;
  gap: 1rem;
  position: absolute;
  top: 2rem;
  right: 4rem;
}

.profile-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.chat-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}
.advertisementBox {
  //text-align: center;
  // flex: 1;
  //font-family:
  //  "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
  //  "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  //font-size: 20px;
  //margin-top: 24px;
  //color: aliceblue;
  //margin-bottom: 24px;
  //width: 100%;
  //background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  //padding: 0.75rem 1.5rem;
  //border: none;
  //border-radius: 8px;
}
.dragButtonBox {
  flex: 1;
  justify-content: center;
  text-align: center;
}
</style>
