import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import Components from 'unplugin-vue-components/vite';
import UiResolver from '@soybeanjs/ui/resolver';
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      Components({
        resolvers: [UiResolver()],
      })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5999,
    proxy: {
      "/api/csqaq": {
        target: "https://api.csqaq.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/csqaq/, ""),
      },
    },
  },
});

