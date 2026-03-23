import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  username: string
  password: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  
  // 预设账号列表
  const accounts = [
    { username: 'admin', password: 'admin', role: 'admin' },
    { username: 'test', password: 'test', role: 'user' },
    { username: 'Chonny', password: 'obj96OBJ', role: 'user' }
  ]
  
  // 登录
  const login = (username: string, password: string) => {
    const account = accounts.find(
      acc => acc.username === username && acc.password === password
    )
    
    if (account) {
      user.value = account
      isAuthenticated.value = true
      return true
    }
    
    return false
  }
  
  // 登出
  const logout = () => {
    user.value = null
    isAuthenticated.value = false
  }
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  }
})
