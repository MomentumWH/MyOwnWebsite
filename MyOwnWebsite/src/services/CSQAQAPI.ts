import axios from "axios";
// import { useAuthStore } from "../stores/auth";
// const authStore = useAuthStore();

const CSQAQAPI = axios.create({
  baseURL: import.meta.env.VITE_CSQAQ_API_BASE_URL || "/api/csqaq",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    //ApiToken: authStore.CSQAQKey,
    ApiToken: "ESNLB1A7B4K6V5H4P0J6P3U4",
  },
});

CSQAQAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

CSQAQAPI.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          console.error("无权限访问");
          break;
        case 404:
          console.error("请求资源不存在");
          break;
        case 500:
          console.error("服务器内部错误");
          break;
        default:
          console.error("请求失败:", error.response.data.message || "未知错误");
      }
    } else if (error.request) {
      console.error("网络错误，请检查网络连接");
    } else {
      console.error("请求配置错误:", error.message);
    }
    return Promise.reject(error);
  },
);

export default CSQAQAPI;
