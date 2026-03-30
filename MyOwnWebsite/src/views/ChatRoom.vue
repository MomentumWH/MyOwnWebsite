<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NButton, NIcon, NAvatar, NScrollbar } from 'naive-ui'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const chatStore = useChatStore()

const inputText = ref('')
const messageListRef = ref<HTMLElement | null>(null)

const initialMessages = [
  {
    id: '1',
    user: 'Ian',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20avatar%20portrait&image_size=square',
    content: '菜塔',
    time: '10:20',
    isSelf: false,
    type: 'text' as const
  },
  {
    id: '2',
    user: 'Ian',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20avatar%20portrait&image_size=square',
    content: '好中锋也不会用',
    time: '10:20',
    isSelf: false,
    type: 'text' as const
  },
  {
    id: '3',
    user: 'Ian',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20avatar%20portrait&image_size=square',
    content: '🐱',
    time: '10:20',
    isSelf: false,
    type: 'emoji' as const
  },
  {
    id: '4',
    user: 'Alex',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20cartoon%20avatar%20portrait&image_size=square',
    content: '瑞典3-1乌克兰晋级附加赛决赛，哲凯赖什帽子戏法\n\n懂球帝/陌议室《瑞典3-1乌克兰晋级附加赛决赛，哲凯赖什帽子戏法》https://m.don...',
    time: '10:21',
    isSelf: false,
    type: 'text' as const
  },
  {
    id: '5',
    user: 'Alex',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20cartoon%20avatar%20portrait&image_size=square',
    content: '🟢 你亦亦子靓版',
    time: '10:21',
    isSelf: false,
    type: 'text' as const
  },
  {
    id: '6',
    user: 'Alex',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20cartoon%20avatar%20portrait&image_size=square',
    content: '是我们拖累了哲凯',
    time: '10:21',
    isSelf: false,
    type: 'text' as const
  },
  {
    id: '7',
    user: 'Chinesesocialist',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=older%20male%20cartoon%20avatar%20portrait&image_size=square',
    content: '法国队锋线太恐怖了',
    time: '10:21',
    isSelf: false,
    type: 'text' as const
  },
  {
    id: '8',
    user: 'Chinesesocialist',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=older%20male%20cartoon%20avatar%20portrait&image_size=square',
    content: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20penguin%20watching%20TV%20with%20popcorn&image_size=square_hd',
    time: '10:22',
    isSelf: false,
    type: 'image' as const
  }
]

const goBack = () => {
  router.back()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (!inputText.value.trim()) return
  
  chatStore.addMessage({
    user: '我',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20profile%20picture&image_size=square',
    content: inputText.value,
    type: 'text',
    isSelf: true
  })
  
  inputText.value = ''
  scrollToBottom()
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

onMounted(() => {
  chatStore.loadFromStorage()
  if (chatStore.messages.length === 0) {
    initialMessages.forEach(msg => {
      chatStore.messages.push(msg)
    })
  }
  scrollToBottom()
})
</script>

<template>
  <div class="chat-room">
    <header class="chat-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          ←
        </button>
        <div class="chat-info">
          <h1 class="chat-title">【五群】桃园球迷交友群(361)</h1>
        </div>
      </div>
      <div class="header-right">
        <button class="icon-button" title="表情">
          <span class="icon">😊</span>
        </button>
        <button class="icon-button" title="语音">
          <span class="icon">📞</span>
        </button>
        <button class="icon-button" title="更多">
          <span class="icon">⋮</span>
        </button>
      </div>
    </header>

    <div class="chat-content" ref="messageListRef">
      <div class="messages-list">
        <div v-for="(message, index) in chatStore.messages" :key="message.id" class="message-item" :class="{ 'message-self': message.isSelf }">
          <div v-if="!message.isSelf" class="message-avatar">
            <n-avatar :src="message.avatar" :size="40" />
          </div>
          <div class="message-wrapper">
            <div v-if="!message.isSelf" class="message-username">{{ message.user }}</div>
            <div class="message-bubble" :class="{ 'bubble-self': message.isSelf }">
              <div v-if="message.type === 'image'" class="message-image">
                <img :src="message.content" alt="聊天图片" />
              </div>
              <div v-else-if="message.type === 'emoji'" class="message-emoji">
                {{ message.content }}
              </div>
              <div v-else class="message-text">
                {{ message.content }}
              </div>
            </div>
            <div class="message-time">{{ message.time }}</div>
          </div>
          <div v-if="message.isSelf" class="message-avatar">
            <n-avatar :src="message.avatar" :size="40" />
          </div>
        </div>
      </div>
    </div>

    <footer class="chat-footer">
      <div class="input-area">
        <div class="input-tools">
          <button class="tool-button" title="表情">
            <span class="tool-icon">😊</span>
          </button>
          <button class="tool-button" title="文件">
            <span class="tool-icon">📁</span>
          </button>
          <button class="tool-button" title="截图">
            <span class="tool-icon">✂️</span>
          </button>
          <button class="tool-button" title="定位">
            <span class="tool-icon">📌</span>
          </button>
          <button class="tool-button" title="语音">
            <span class="tool-icon">🎤</span>
          </button>
        </div>
        <div class="input-wrapper">
          <n-input
            v-model:value="inputText"
            type="textarea"
            placeholder="输入消息..."
            :autosize="{ minRows: 1, maxRows: 4 }"
            @keypress="handleKeyPress"
            class="chat-input"
          />
        </div>
        <div class="send-button-wrapper">
          <n-button type="primary" @click="sendMessage" :disabled="!inputText.trim()">
            发送
          </n-button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.98);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.back-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.chat-info {
  display: flex;
  flex-direction: column;
}

.chat-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-button:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.icon {
  font-size: 20px;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-content::-webkit-scrollbar {
  display: none;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-self {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.message-self .message-wrapper {
  align-items: flex-end;
}

.message-username {
  font-size: 12px;
  color: #999;
  padding: 0 8px;
}

.message-bubble {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  word-break: break-word;
  transition: all 0.3s ease;
}

.message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.bubble-self {
  background: linear-gradient(135deg, #95ec69 0%, #4facfe 100%);
}

.message-text {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
  font-weight: 400;
}

.message-emoji {
  font-size: 48px;
  line-height: 1;
}

.message-image {
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.message-image img {
  width: 100%;
  height: auto;
  display: block;
}

.message-time {
  font-size: 11px;
  color: #ccc;
  padding: 0 8px;
}

.chat-footer {
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 20px 24px;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-tools {
  display: flex;
  gap: 8px;
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-button:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.tool-icon {
  font-size: 20px;
}

.input-wrapper {
  flex: 1;
}

.chat-input :deep(.n-input-wrapper) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.chat-input :deep(.n-input--focus .n-input-wrapper) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.chat-input :deep(.n-input__textarea-el) {
  font-size: 15px;
  line-height: 1.7;
  font-weight: 400;
  color: #333;
}

.send-button-wrapper {
  display: flex;
  justify-content: flex-end;
}

.send-button-wrapper :deep(.n-button) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.send-button-wrapper :deep(.n-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.send-button-wrapper :deep(.n-button:active) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(102, 126, 234, 0.3);
}
</style>
