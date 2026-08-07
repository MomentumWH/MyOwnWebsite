import { createHttpClient } from "@/services/httpClient";

const CSQAQAPI = createHttpClient({
  apiToken: import.meta.env.VITE_CSQAQ_API_TOKEN,
  baseURL: import.meta.env.VITE_CSQAQ_API_BASE_URL || "/api/csqaq",
});

export default CSQAQAPI;
