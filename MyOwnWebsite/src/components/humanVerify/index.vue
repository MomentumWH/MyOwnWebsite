<script setup lang="ts">
import { computed, ref } from "vue";

const emit = defineEmits<{
  verified: [value: boolean];
}>();

const code = ref("");
const answer = ref("");
const isVerified = ref(false);

const generateCode = () => {
  code.value = String(Math.floor(1000 + Math.random() * 9000));
  answer.value = "";
  isVerified.value = false;
  emit("verified", false);
};

const verifyCode = () => {
  const verified = answer.value.trim() === code.value;
  isVerified.value = verified;
  emit("verified", verified);
};

const verifyStatusText = computed(() => isVerified.value ? "验证通过" : "请输入右侧数字");

generateCode();
</script>

<template>
  <div class="human-verify">
    <div class="verify-code" title="点击刷新验证码" @click="generateCode">
      <span v-for="(digit, index) in code" :key="`${code}-${index}`">{{ digit }}</span>
    </div>

    <div class="verify-control">
      <input
        v-model="answer"
        class="verify-input"
        inputmode="numeric"
        maxlength="4"
        placeholder="输入验证码"
        type="text"
        @input="verifyCode"
      />
      <button class="refresh-btn" type="button" @click="generateCode">刷新</button>
    </div>

    <p class="verify-status" :class="{ 'verify-status--success': isVerified }">
      {{ verifyStatusText }}
    </p>
  </div>
</template>

<style scoped>
.human-verify {
  display: grid;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid rgba(102, 126, 234, 0.16);
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.08);
}

.verify-code {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  color: #4f5ed7;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  cursor: pointer;
  user-select: none;
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(232, 235, 255, 0.92)),
    repeating-linear-gradient(45deg, transparent 0 8px, rgba(102, 126, 234, 0.12) 8px 10px);
  box-shadow: inset 0 0 0 1px rgba(102, 126, 234, 0.12);
}

.verify-code span:nth-child(2n) {
  transform: translateY(2px) rotate(6deg);
}

.verify-code span:nth-child(2n + 1) {
  transform: translateY(-1px) rotate(-5deg);
}

.verify-control {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.65rem;
}

.verify-input {
  width: 100%;
  min-width: 0;
  padding: 0.72rem 0.75rem;
  font-size: 0.95rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.verify-input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.refresh-btn {
  padding: 0 0.85rem;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: #667eea;
  transition: background 0.3s ease, transform 0.3s ease;
}

.refresh-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.verify-status {
  margin: 0;
  color: #777;
  font-size: 0.8rem;
}

.verify-status--success {
  color: #2f9e44;
  font-weight: 700;
}
</style>


