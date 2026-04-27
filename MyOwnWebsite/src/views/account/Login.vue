<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);

// 星星动画
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface Line {
  id: number;
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

const stars = ref<Star[]>([]);
const lines = ref<Line[]>([]);
let particleId = 0;

const createStar = () => {
  return {
    id: particleId++,
    x: Math.random() * window.innerWidth,
    y: -100,
    size: Math.random() * 6 + 2,
    speed: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.5,
  };
};

const createLine = () => {
  return {
    id: particleId++,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    length: Math.random() * 200 + 100,
    speed: Math.random() * 2 + 1,
    opacity: Math.random() * 0.3 + 0.2,
  };
};

const updateStars = () => {
  for (let index = stars.value.length - 1; index >= 0; index -= 1) {
    const star = stars.value[index];
    star.y += star.speed;

    if (star.y >= window.innerHeight) {
      stars.value.splice(index, 1);
    }
  }

  // 移除超出屏幕的星星

  // 添加新星星
  if (stars.value.length < 100) {
    stars.value.push(createStar());
  }
};

const updateLines = () => {
  for (let index = lines.value.length - 1; index >= 0; index -= 1) {
    const line = lines.value[index];
    line.x -= line.speed;
    line.y += line.speed;

    const endX = line.x + line.length * Math.cos(Math.PI / 4);
    if (!(endX > 0 && line.y < window.innerHeight)) {
      lines.value.splice(index, 1);
    }
  }

  // 移除完全超出屏幕的线条（考虑45度旋转后的实际位置）
  const cos45 = Math.cos(Math.PI / 4);
  lines.value = lines.value.filter((line) => {
    // 计算线条右端点的x坐标
    const endX = line.x + line.length * cos45;
    // 保留仍有部分在屏幕内的线条
    return endX > 0 && line.y < window.innerHeight;
  });

  // 添加新线条
  if (lines.value.length < 20) {
    lines.value.push(createLine());
  }
};

let animationFrameId = 0;

onMounted(() => {
  const animate = () => {
    updateStars();
    updateLines();
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});

const handleLogin = async () => {
  if (!username.value || !password.value) {
    message.error("用户名或密码不能为空");
    return;
  }

  isLoading.value = true;

  // 模拟登录延迟
  setTimeout(async () => {
    // 使用 Pinia 进行登录校验
    const success = authStore.login(username.value, password.value);

    if (success) {
      message.success("登录成功");
      // 获取重定向路径
      const redirect = router.currentRoute.value.query.redirect;
      const target =
        typeof redirect === "string" && redirect !== "/login" ? redirect : "/";

      await router.replace(target);
    } else {
      message.error("用户名或密码错误");
    }

    isLoading.value = false;
  }, 1000);
};

const useTestAccount = (type: "admin" | "user" | "Chonny") => {
  if (type === "admin") {
    username.value = "admin";
    password.value = "admin";
  } else if (type === "user") {
    username.value = "test";
    password.value = "test";
  } else if (type === "Chonny") {
    username.value = "Chonny";
    password.value = "obj96OBJ";
  }
};
</script>

<template>
  <div class="login-page">
    <!-- 星星背景 -->
    <div class="stars-container">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="{
          left: `${star.x}px`,
          top: `${star.y}px`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
        }"
      ></div>
    </div>

    <!-- 斜向流动线条 -->
    <div class="lines-container">
      <div
        v-for="line in lines"
        :key="line.id"
        class="line"
        :style="{
          left: `${line.x}px`,
          top: `${line.y}px`,
          width: `${line.length}px`,
          opacity: line.opacity,
        }"
      ></div>
    </div>

    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">📊</span>
          <h1>Chonny's Channel</h1>
        </div>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <div class="test-accounts">
        <h3>测试账号</h3>
        <div class="account-item">
          <span class="account-label">管理员:</span>
          <span class="account-info">admin / admin</span>
          <button @click="useTestAccount('admin')" class="use-btn">使用</button>
        </div>
        <!-- <div class="account-item">
          <span class="account-label">测试用户:</span>
          <span class="account-info">test / test</span>
          <button @click="useTestAccount('user')" class="use-btn">使用</button>
        </div> -->
        <div class="account-item">
          <span class="account-label">Producer:</span>
          <span class="account-info">Chonny / obj96OBJ</span>
          <button @click="useTestAccount('Chonny')" class="use-btn">
            使用
          </button>
        </div>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label for="username">用户名或邮箱</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名或邮箱"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="form-input"
          />
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input v-model="rememberMe" type="checkbox" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>

        <button @click="handleLogin" class="login-btn" :disabled="isLoading">
          <span v-if="!isLoading">登录</span>
          <span v-else>登录中...</span>
        </button>

        <div class="register-link">
          <span>还没有账户?</span>
          <a href="#" class="register-btn">立即注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(
      circle at 20% 80%,
      rgba(120, 119, 198, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 119, 198, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(120, 119, 198, 0.2) 0%,
      transparent 50%
    );
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.stars-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: starFade 2s ease-in-out infinite;
}

@keyframes starFade {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.lines-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, white, transparent);
  transform: rotate(-45deg);
  animation: lineFade 3s ease-in-out infinite;
}

@keyframes lineFade {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
}

.login-container {
  width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo h1 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.login-header p {
  color: #666;
  margin: 0;
}

.test-accounts {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.test-accounts h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.account-label {
  font-weight: 600;
  color: #333;
}

.account-info {
  color: #666;
}

.use-btn {
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.3s ease;
}

.use-btn:hover {
  background: #5568d3;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-sizing: border-box;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

.register-btn {
  color: #667eea;
  text-decoration: none;
  margin-left: 0.5rem;
  font-weight: 600;
}

.register-btn:hover {
  text-decoration: underline;
}
</style>
