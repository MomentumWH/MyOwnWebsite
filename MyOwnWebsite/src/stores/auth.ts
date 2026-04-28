import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface User {
  username: string;
  role: string;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const initialized = ref(false);
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));

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

  const initAuth = () => {
    if (initialized.value) {
      return;
    }

    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
        token.value = savedToken;
        isAuthenticated.value = true;
        initialized.value = true;
      } catch (e) {
        clearAuth();
      }
    } else {
      clearAuth();
    }
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    initialized.value = true;
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
      initialized.value = true;

      const nextToken = btoa(`${username}:${Date.now()}`);
      token.value = nextToken;
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return true;
    }

    return false;
  };

  const logout = () => {
    clearAuth();
  };

  return {
    user,
    isAuthenticated,
    initialized,
    token,
    canAccessChatRoom,
    login,
    logout,
    initAuth,
    CSQAQKey,
  };
});
