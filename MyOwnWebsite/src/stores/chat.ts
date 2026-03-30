import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

interface Message {
  id: string
  user: string
  avatar: string
  content: string
  type: 'text' | 'image' | 'emoji'
  time: string
  isSelf: boolean
}

const STORAGE_KEY = 'chat-messages'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isHydrated = ref(false)

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        messages.value = JSON.parse(stored)
      }
      isHydrated.value = true
    } catch (error) {
      console.error('Failed to load chat messages from storage:', error)
      isHydrated.value = true
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
    } catch (error) {
      console.error('Failed to save chat messages to storage:', error)
    }
  }

  const addMessage = (message: Omit<Message, 'id' | 'time'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(newMessage)
  }

  const clearMessages = () => {
    messages.value = []
  }

  watch(
    messages,
    () => {
      if (isHydrated.value) {
        saveToStorage()
      }
    },
    { deep: true }
  )

  return {
    messages,
    loadFromStorage,
    addMessage,
    clearMessages
  }
})
