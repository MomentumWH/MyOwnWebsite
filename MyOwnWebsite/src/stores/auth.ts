import { defineStore } from "pinia";
import { ref, computed, onMounted } from "vue";

interface User {
  username: string;
  role: string;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);

  const accounts = [
    { username: "admin", password: "admin", role: "admin" },
    { username: "test", password: "test", role: "user" },
    { username: "Chonny", password: "obj96OBJ", role: "user" },
  ];

  const CSQAQKey = "ESNLB1A7B4K6V5H4P0J6P3U4";

  const canAccessChatRoom = computed(() => {
    if (!user.value) return false;
    return user.value.username === "Chonny" || user.value.username === "admin";
  });

  const token = computed(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const initAuth = () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
        isAuthenticated.value = true;
      } catch (e) {
        clearAuth();
      }
    }
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = (username: string, password: string) => {
    const account = accounts.find(
      (acc) => acc.username === username && acc.password === password,
    );

    if (account) {
      const { password: _, ...userData } = account;
      user.value = userData;
      isAuthenticated.value = true;

      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return true;
    }

    return false;
  };

  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
    clearAuth();
  };

  return {
    user,
    isAuthenticated,
    token,
    canAccessChatRoom,
    login,
    logout,
    initAuth,
    CSQAQKey,
  };
});
