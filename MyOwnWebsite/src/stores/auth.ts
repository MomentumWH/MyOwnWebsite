import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface User {
  username: string;
  password: string;
  role: string;
}

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

  const login = (username: string, password: string) => {
    const account = accounts.find(
      (acc) => acc.username === username && acc.password === password,
    );

    if (account) {
      user.value = account;
      isAuthenticated.value = true;
      return true;
    }

    return false;
  };

  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
  };

  return {
    user,
    isAuthenticated,
    canAccessChatRoom,
    login,
    logout,
  };
});
