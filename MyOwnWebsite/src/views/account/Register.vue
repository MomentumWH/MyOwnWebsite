<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import HumanVerify from "@/components/humanVerify/index.vue";
import { RegisteredAccountStorageKey, readRegisteredAccounts, writeRegisteredAccounts } from "@/stores/auth";

const router = useRouter();
const message = useMessage();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const email = ref("");
const isHumanVerified = ref(false);
const isLoading = ref(false);

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
let animationFrameId = 0;

const createStar = () => ({
  id: particleId++,
  x: Math.random() * window.innerWidth,
  y: -100,
  size: Math.random() * 6 + 2,
  speed: Math.random() * 3 + 1,
  opacity: Math.random() * 0.5 + 0.5,
});

const createLine = () => ({
  id: particleId++,
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  length: Math.random() * 200 + 100,
  speed: Math.random() * 2 + 1,
  opacity: Math.random() * 0.3 + 0.2,
});

const updateStars = () => {
  for (let index = stars.value.length - 1; index >= 0; index -= 1) {
    const star = stars.value[index];
    star.y += star.speed;

    if (star.y >= window.innerHeight) {
      stars.value.splice(index, 1);
    }
  }

  if (stars.value.length < 100) {
    stars.value.push(createStar());
  }
};

const updateLines = () => {
  const cos45 = Math.cos(Math.PI / 4);

  for (let index = lines.value.length - 1; index >= 0; index -= 1) {
    const line = lines.value[index];
    line.x -= line.speed;
    line.y += line.speed;

    const endX = line.x + line.length * cos45;
    if (!(endX > 0 && line.y < window.innerHeight)) {
      lines.value.splice(index, 1);
    }
  }

  if (lines.value.length < 20) {
    lines.value.push(createLine());
  }
};

const goToLogin = () => {
  router.push("/login");
};

const validateEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

const handleRegister = () => {
  const nextUsername = username.value.trim();
  const nextEmail = email.value.trim();

  if (!nextUsername || !password.value || !confirmPassword.value || !nextEmail) {
    message.error("请完整填写用户名、密码、确认密码和邮箱");
    return;
  }

  if (!validateEmail(nextEmail)) {
    message.error("请输入正确的邮箱格式");
    return;
  }

  if (password.value.length < 6) {
    message.error("密码长度不能少于 6 位");
    return;
  }

  if (password.value !== confirmPassword.value) {
    message.error("两次输入的密码不一致");
    return;
  }

  if (!isHumanVerified.value) {
    message.error("请先完成数字验证码验证");
    return;
  }

  const accounts = readRegisteredAccounts();
  const exists = accounts.some(
    (account) => account.username === nextUsername || account.email === nextEmail,
  );

  if (exists) {
    message.error("用户名或邮箱已被注册");
    return;
  }

  isLoading.value = true;

  setTimeout(async () => {
    writeRegisteredAccounts([
      ...accounts,
      {
        username: nextUsername,
        password: password.value,
        email: nextEmail,
        role: "user",
        createdAt: new Date().toISOString(),
      },
    ]);

    message.success(`注册成功，账号已写入本地缓存：${RegisteredAccountStorageKey}`);
    isLoading.value = false;
    await router.replace("/login");
  }, 800);
};

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
</script>

<template>
  <div class="register-page">
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

    <div class="register-container">
      <div class="register-header">
        <div class="logo">
          <span class="logo-icon">📊</span>
          <h1>Join Chonny's Channel</h1>
        </div>
        <p>创建账户后即可使用本地账号登录</p>
      </div>

      <div class="register-form">
        <div class="form-group">
          <label for="register-username">用户名</label>
          <input
            id="register-username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="register-email">邮箱</label>
          <input
            id="register-email"
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="register-password">密码</label>
          <input
            id="register-password"
            v-model="password"
            type="password"
            placeholder="请输入密码（至少 6 位）"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="register-confirm-password">确认密码</label>
          <input
            id="register-confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>数字验证码</label>
          <HumanVerify @verified="isHumanVerified = $event" />
        </div>

        <button class="register-btn" :disabled="isLoading" @click="handleRegister">
          <span v-if="!isLoading">注册</span>
          <span v-else>注册中...</span>
        </button>

        <div class="login-link">
          <span>已经有账户?</span>
          <button class="login-btn" type="button" @click="goToLogin">返回登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  box-sizing: border-box;
}

.register-page::before {
  position: absolute;
  width: 100%;
  height: 100%;
  content: "";
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
  animation: twinkle 3s ease-in-out infinite;
}

.stars-container,
.lines-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: starFade 2s ease-in-out infinite;
}

.line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, white, transparent);
  transform: rotate(-45deg);
  animation: lineFade 3s ease-in-out infinite;
}

.register-container {
  z-index: 1;
  width: min(430px, 100%);
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.register-header {
  margin-bottom: 1.75rem;
  text-align: center;
}

.logo {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo h1 {
  margin: 0;
  color: #333;
  font-size: 1.45rem;
}

.register-header p {
  margin: 0;
  color: #666;
}

.register-form {
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
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
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.register-btn {
  width: 100%;
  padding: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.register-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.login-link {
  margin-top: 1rem;
  color: #666;
  font-size: 0.875rem;
  text-align: center;
}

.login-btn {
  margin-left: 0.5rem;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: transparent;
}

.login-btn:hover {
  text-decoration: underline;
}

@keyframes twinkle {
  0%,
  100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes starFade {
  0%,
  100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes lineFade {
  0%,
  100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

@media (max-width: 520px) {
  .register-container {
    padding: 1.5rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }
}
</style>
