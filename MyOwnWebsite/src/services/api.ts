import { createHttpClient } from "@/services/httpClient";

const api = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

export default api;
