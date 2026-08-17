<script setup lang="ts">
import {
  CloseOutline,
  ImageOutline,
  NavigateOutline,
  SendOutline,
  SparklesOutline,
} from "@vicons/ionicons5";
import { NIcon, NTooltip } from "naive-ui";
import { computed, nextTick, onMounted, onUnmounted, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePageAgent } from "./usePageAgent";

const router = useRouter();
const route = useRoute();
const {
  agentMode,
  clearImage,
  close,
  draft,
  handleImageSelected,
  imageError,
  isImageLoading,
  isOpen,
  isRunning,
  messages,
  run,
  selectedImage,
  streamingMessageId,
  toggle,
} = usePageAgent({ router, route });

const inputRef = useTemplateRef<HTMLInputElement>("agentInput");
const imageInputRef = useTemplateRef<HTMLInputElement>("imageInput");
const messageListRef = useTemplateRef<HTMLElement>("messageList");
const quickPrompts = ["这个页面有什么", "向下浏览", "返回顶部"] as const;
const triggerClasses = computed(() => ({
  "agent-trigger--open": isOpen.value,
}));

const focusInput = async () => {
  await nextTick();
  inputRef.value?.focus();
};

const handleToggle = () => {
  toggle();
  if (isOpen.value) {
    focusInput();
  }
};

const handleSubmit = (event: KeyboardEvent) => {
  if (event.isComposing) {
    return;
  }

  event.preventDefault();
  run();
};

const openImagePicker = () => {
  imageInputRef.value?.click();
};

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.altKey && event.key.toLocaleLowerCase() === "a") {
    event.preventDefault();
    handleToggle();
  }

  if (event.key === "Escape" && isOpen.value) {
    close();
  }
};

watch(
  () => `${messages.value.length}:${messages.value.at(-1)?.content.length ?? 0}`,
  async () => {
    await nextTick();
    messageListRef.value?.scrollTo({
      top: messageListRef.value.scrollHeight,
      behavior: isRunning.value ? "auto" : "smooth",
    });
  },
);

onMounted(() => window.addEventListener("keydown", handleGlobalKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleGlobalKeydown));
</script>

<template>
  <Teleport to="body">
    <div class="page-agent">
      <Transition name="agent-panel">
        <section
          v-if="isOpen"
          id="page-agent-panel"
          class="agent-panel"
          role="dialog"
          aria-label="页面 Agent"
        >
          <header class="agent-header">
            <div class="agent-identity">
              <span class="agent-mark" aria-hidden="true">
                <NIcon><SparklesOutline /></NIcon>
              </span>
              <div>
                <p>PAGE AGENT</p>
                <span :class="{ 'is-local': agentMode === 'local', 'is-running': isRunning }">
                  <i></i> {{ agentMode === "codex" ? "Codex 在线" : "本地回退" }}
                </span>
              </div>
            </div>

            <NTooltip trigger="hover">
              <template #trigger>
                <button class="icon-button" type="button" aria-label="关闭页面 Agent" @click="close">
                  <NIcon><CloseOutline /></NIcon>
                </button>
              </template>
              关闭
            </NTooltip>
          </header>

          <div
            ref="messageList"
            class="agent-messages"
            aria-live="polite"
            :aria-busy="isRunning"
          >
            <div
              v-for="message in messages"
              :key="message.id"
              class="agent-message"
              :class="[
                `agent-message--${message.role}`,
                { 'is-streaming': streamingMessageId === message.id },
              ]"
            >
              <span v-if="message.role === 'agent'" class="message-label">AGENT</span>
              <img
                v-if="message.image"
                class="message-image"
                :src="message.image.dataUrl"
                :alt="message.image.name"
                loading="lazy"
              />
              <p>{{ message.content }}</p>
            </div>

            <div v-if="isRunning" class="agent-thinking" aria-label="Agent 正在思考">
              <span class="agent-thinking__orb" aria-hidden="true">
                <i></i><i></i><i></i>
              </span>
              <span class="agent-thinking__label">正在思考</span>
              <span class="agent-thinking__trail" aria-hidden="true"></span>
            </div>
          </div>

          <div class="agent-prompts" aria-label="快捷指令">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              type="button"
              :disabled="isRunning"
              @click="run(prompt)"
            >
              {{ prompt }}
            </button>
          </div>

          <div v-if="selectedImage || imageError || isImageLoading" class="agent-attachment" role="status">
            <img
              v-if="selectedImage"
              class="agent-attachment__preview"
              :src="selectedImage.dataUrl"
              :alt="selectedImage.name"
            />
            <div class="agent-attachment__meta">
              <span v-if="selectedImage">{{ selectedImage.name }}</span>
              <span v-if="imageError" class="agent-attachment__error">{{ imageError }}</span>
              <span v-else-if="isImageLoading">正在读取图片...</span>
            </div>
            <NTooltip v-if="selectedImage" trigger="hover">
              <template #trigger>
                <button
                  class="attachment-remove"
                  type="button"
                  aria-label="移除图片"
                  :disabled="isRunning || isImageLoading"
                  @click="clearImage"
                >
                  <NIcon><CloseOutline /></NIcon>
                </button>
              </template>
              移除图片
            </NTooltip>
          </div>

          <div class="agent-composer" :class="{ 'is-busy': isRunning }">
            <NIcon class="composer-icon"><NavigateOutline /></NIcon>
            <input
              ref="imageInput"
              class="image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              aria-label="插入图片"
              @change="handleImageSelected"
            />
            <NTooltip trigger="hover">
              <template #trigger>
                <button
                  class="image-button"
                  type="button"
                  aria-label="插入图片"
                  :disabled="isRunning || isImageLoading"
                  @click="openImagePicker"
                >
                  <NIcon><ImageOutline /></NIcon>
                </button>
              </template>
              插入图片
            </NTooltip>
            <input
              ref="agentInput"
              v-model="draft"
              type="text"
              autocomplete="off"
              placeholder="告诉 Agent 要执行什么..."
              aria-label="输入页面指令"
              :disabled="isRunning"
              @keydown.enter="handleSubmit"
            />
            <NTooltip trigger="hover">
              <template #trigger>
                <button
                  class="send-button"
                  type="button"
                  aria-label="执行指令"
                  :disabled="(!draft.trim() && !selectedImage) || isRunning || isImageLoading"
                  @click="run()"
                >
                  <NIcon><SendOutline /></NIcon>
                </button>
              </template>
              执行
            </NTooltip>
          </div>
        </section>
      </Transition>

      <NTooltip placement="left" trigger="hover">
        <template #trigger>
          <button
            class="agent-trigger"
            :class="triggerClasses"
            type="button"
            aria-controls="page-agent-panel"
            :aria-expanded="isOpen"
            :aria-label="isOpen ? '收起页面 Agent' : '打开页面 Agent'"
            @click="handleToggle"
          >
            <NIcon><SparklesOutline /></NIcon>
            <span class="agent-trigger__label" :aria-hidden="!isOpen">Agent</span>
          </button>
        </template>
        {{ isOpen ? "收起页面 Agent" : "打开页面 Agent" }}
      </NTooltip>
    </div>
  </Teleport>
</template>

<style scoped>
.page-agent {
  --agent-ink: #f5f2e9;
  --agent-muted: #9d9b94;
  --agent-panel: #171817;
  --agent-line: rgba(255, 255, 255, 0.11);
  --agent-accent: #d5ff45;
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 12000;
  color: var(--agent-ink);
  font-family: "Lato", "Microsoft YaHei", sans-serif;
  letter-spacing: 0;
}

.agent-trigger {
  display: inline-flex;
  gap: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-width: 44px;
  height: 44px;
  padding: 0;
  color: #10110e;
  font: inherit;
  line-height: 1;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 50%;
  background: var(--agent-accent);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  transition:
    width 240ms cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 240ms ease,
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.agent-trigger :deep(.n-icon) {
  flex: 0 0 auto;
  font-size: 19px;
}

.agent-trigger--open {
  gap: 8px;
  width: 94px;
  border-radius: 22px;
}

.agent-trigger__label {
  width: 0;
  overflow: hidden;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-5px);
  transition:
    width 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 150ms ease,
    transform 220ms ease;
}

.agent-trigger--open .agent-trigger__label {
  width: 40px;
  opacity: 1;
  transform: translateX(0);
}

.agent-trigger:hover {
  background: #e1ff7a;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.34);
  transform: translateY(-2px);
}

.agent-trigger:focus-visible,
.icon-button:focus-visible,
.image-button:focus-visible,
.attachment-remove:focus-visible,
.send-button:focus-visible,
.agent-prompts button:focus-visible,
.agent-composer input:focus-visible {
  outline: 2px solid var(--agent-accent);
  outline-offset: 3px;
}

.agent-panel {
  position: absolute;
  top: 56px;
  right: 0;
  display: grid;
  grid-template-rows: auto minmax(170px, 1fr) auto auto auto;
  width: min(390px, calc(100vw - 32px));
  height: min(590px, calc(100dvh - 92px));
  overflow: hidden;
  border: 1px solid var(--agent-line);
  border-radius: 6px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    var(--agent-panel);
  background-size: 100% 32px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
}

.agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--agent-line);
  background: rgba(23, 24, 23, 0.96);
}

.agent-identity {
  display: flex;
  gap: 11px;
  align-items: center;
}

.agent-mark {
  display: grid;
  width: 38px;
  height: 38px;
  color: #11120f;
  border-radius: 3px;
  background: var(--agent-accent);
  place-items: center;
}

.agent-identity p {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0;
}

.agent-identity div > span {
  display: flex;
  gap: 7px;
  align-items: center;
  color: var(--agent-muted);
  font-size: 12px;
}

.agent-identity i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--agent-accent);
  box-shadow: 0 0 10px rgba(213, 255, 69, 0.72);
}

.agent-identity .is-local i {
  background: #f2bd5a;
  box-shadow: 0 0 10px rgba(242, 189, 90, 0.62);
}

.agent-identity .is-running i {
  animation: statusPulse 1.35s ease-in-out infinite;
}

.icon-button,
.send-button {
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  color: var(--agent-ink);
  font-size: 19px;
  cursor: pointer;
  border: 1px solid var(--agent-line);
  border-radius: 3px;
  background: transparent;
  place-items: center;
}

.icon-button:hover {
  color: #11120f;
  background: var(--agent-accent);
}

.agent-messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  padding: 18px 16px;
  overflow-y: auto;
  scrollbar-color: rgba(213, 255, 69, 0.45) transparent;
  scrollbar-width: thin;
}

.agent-message {
  max-width: 88%;
}

.agent-message p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message-image {
  display: block;
  width: auto;
  max-width: min(220px, 100%);
  max-height: 180px;
  margin-bottom: 8px;
  object-fit: cover;
  border: 1px solid var(--agent-line);
  border-radius: 4px;
}

.agent-message--agent {
  align-self: flex-start;
  animation: agentMessageIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.agent-message--agent p {
  padding-left: 11px;
  border-left: 2px solid var(--agent-accent);
}

.agent-message--agent.is-streaming p::after {
  display: inline-block;
  width: 6px;
  height: 1em;
  margin-left: 4px;
  vertical-align: -0.15em;
  content: "";
  background: var(--agent-accent);
  animation: streamCaret 780ms ease-in-out infinite;
}

.agent-message--user {
  align-self: flex-end;
  padding: 10px 12px;
  color: #171817;
  border-radius: 4px 4px 0 4px;
  background: #eeece5;
}

.message-label {
  display: block;
  margin-bottom: 7px;
  color: var(--agent-accent);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0;
}

.agent-thinking {
  display: flex;
  position: relative;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 22px;
  padding: 4px 0;
  color: var(--agent-muted);
  font-size: 12px;
  line-height: 1;
}

.agent-thinking__orb {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  width: 22px;
  height: 14px;
}

.agent-thinking__orb i {
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--agent-accent);
  box-shadow: 0 0 8px rgba(213, 255, 69, 0.45);
  animation: thinkingDot 1.05s ease-in-out infinite;
}

.agent-thinking__orb i:nth-child(2) { animation-delay: 140ms; }
.agent-thinking__orb i:nth-child(3) { animation-delay: 280ms; }

.agent-thinking__label {
  animation: thinkingLabel 1.8s ease-in-out infinite;
}

.agent-thinking__trail {
  position: absolute;
  right: 0;
  bottom: -3px;
  left: 0;
  height: 1px;
  overflow: hidden;
  opacity: 0.5;
}

.agent-thinking__trail::after {
  position: absolute;
  width: 38%;
  height: 100%;
  content: "";
  background: linear-gradient(90deg, transparent, var(--agent-accent), transparent);
  animation: thinkingSweep 1.8s ease-in-out infinite;
}

.agent-attachment {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 58px;
  padding: 8px 12px;
  border-top: 1px solid var(--agent-line);
  background: rgba(17, 18, 16, 0.92);
}

.agent-attachment__preview {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  object-fit: cover;
  border: 1px solid var(--agent-line);
  border-radius: 3px;
}

.agent-attachment__meta {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  color: var(--agent-muted);
  font-size: 12px;
  line-height: 1.3;
}

.agent-attachment__meta > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-attachment__error {
  color: #f2bd5a;
}

.attachment-remove,
.image-button {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  padding: 0;
  color: var(--agent-muted);
  font-size: 17px;
  cursor: pointer;
  border: 1px solid var(--agent-line);
  border-radius: 3px;
  background: transparent;
  place-items: center;
}

.attachment-remove:hover,
.image-button:hover {
  color: #11120f;
  border-color: var(--agent-accent);
  background: var(--agent-accent);
}

.agent-prompts {
  display: flex;
  gap: 7px;
  padding: 11px 14px;
  overflow-x: auto;
  border-top: 1px solid var(--agent-line);
}

.agent-prompts button {
  flex: 0 0 auto;
  min-height: 30px;
  padding: 0 10px;
  color: #cbc9c1;
  font: inherit;
  font-size: 12px;
  letter-spacing: 0;
  cursor: pointer;
  border: 1px solid var(--agent-line);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.035);
}

.agent-prompts button:hover {
  color: var(--agent-accent);
  border-color: rgba(213, 255, 69, 0.45);
}

.agent-composer {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 62px;
  padding: 10px 12px;
  border-top: 1px solid var(--agent-line);
  background: #111210;
  transition: box-shadow 260ms ease, border-color 260ms ease;
}

.agent-composer.is-busy {
  border-top-color: rgba(213, 255, 69, 0.3);
  box-shadow: inset 0 1px 0 rgba(213, 255, 69, 0.08);
}

.image-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.composer-icon {
  color: var(--agent-accent);
  font-size: 18px;
}

.agent-composer input {
  width: 100%;
  min-width: 0;
  height: 40px;
  padding: 0;
  color: var(--agent-ink);
  font: inherit;
  font-size: 14px;
  letter-spacing: 0;
  border: 0;
  background: transparent;
}

.agent-composer input::placeholder {
  color: #777871;
}

.agent-composer input:focus {
  outline: none;
}

.send-button {
  color: #10110e;
  border-color: var(--agent-accent);
  background: var(--agent-accent);
}

.send-button:disabled,
.agent-prompts button:disabled,
.image-button:disabled,
.attachment-remove:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.agent-panel-enter-active,
.agent-panel-leave-active {
  transition: opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: top right;
}

.agent-panel-enter-from,
.agent-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

@keyframes thinkingDot {
  0%, 100% { opacity: 0.3; transform: translateY(1px) scale(0.82); }
  45% { opacity: 1; transform: translateY(-2px) scale(1.12); }
}

@keyframes thinkingLabel {
  0%, 100% { opacity: 0.52; }
  50% { opacity: 1; }
}

@keyframes thinkingSweep {
  0% { transform: translateX(-130%); }
  55%, 100% { transform: translateX(360%); }
}

@keyframes statusPulse {
  0%, 100% { opacity: 0.45; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes agentMessageIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes streamCaret {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}

@media (max-width: 640px) {
  .page-agent {
    top: 12px;
    right: 12px;
  }

  .agent-panel {
    position: fixed;
    top: 66px;
    right: 12px;
    left: 12px;
    width: auto;
    height: min(580px, calc(100dvh - 78px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-trigger,
  .agent-trigger__label,
  .agent-panel-enter-active,
  .agent-panel-leave-active {
    transition-duration: 1ms;
  }

  .agent-thinking__orb i,
  .agent-thinking__label,
  .agent-thinking__trail::after,
  .agent-identity .is-running i {
    animation: none;
  }

  .agent-message--agent {
    animation: none;
  }

  .agent-message--agent.is-streaming p::after {
    animation: none;
    opacity: 0.7;
  }
}
</style>
