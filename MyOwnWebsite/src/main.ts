import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./style.css";
import "./permission";
import { createFitScale } from "vfit";
import "vfit/style.css"; // ⚠️ 划重点：一定要引入这个样式，不然布局组件会失效
import "vfonts/Lato.css";
import "vfonts/FiraCode.css";
import naive from "naive-ui";
import dayjs from "dayjs";
//import "./bones/registry";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(
  createFitScale({
    target: "#app", // 告诉它要在哪个容器搞事情
    designWidth: 1920, // 设计稿宽
    designHeight: 1080, // 设计稿高
    scaleMode: "auto", // 默认 auto 就能应付绝大多数情况
  }),
);
app.use(naive);
app.mount("#app");
