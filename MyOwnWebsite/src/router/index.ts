import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/account/Login.vue"),
    meta: { title: "Login" },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/account/Register.vue"),
    meta: { title: "Register" },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/account/Profile.vue"),
    meta: { title: "Profile" },
  },
  {
    path: "/chat-room",
    name: "chat-room",
    component: () => import("@/views/account/ChatRoom.vue"),
    meta: {
      requiresChatRoomAccess: true,
      title: "Chat Room",
    },
  },
  {
    path: "/",
    name: "home",
    component: () => import("@/views/base/Home.vue"),
    meta: { title: "Home" },
  },
  {
    path: "/guide",
    name: "guide",
    component: () => import("@/pages/guidePage/index.vue"),
    meta: { title: "教程中心" },
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/views/base/About.vue"),
    props: true,
    meta: { title: "About" },
  },
  {
    path: "/blog",
    name: "blog",
    component: () => import("@/views/labs/Blog.vue"),
    meta: { title: "Blog" },
  },
  {
    path: "/ecommerce",
    name: "ecommerce",
    component: () => import("@/views/labs/Ecommerce.vue"),
    meta: { title: "Ecommerce" },
  },
  {
    path: "/data-visualization",
    name: "data-visualization",
    component: () => import("@/views/labs/DataVisualization.vue"),
    meta: { title: "Data Visualization" },
  },
  {
    path: "/arsenal-season",
    name: "arsenal-season",
    component: () => import("@/views/football/ArsenalSeason.vue"),
    meta: { title: "阿森纳赛季走势" },
  },
  {
    path: "/drag-box",
    name: "drag-box",
    component: () => import("@/views/labs/DragBox.vue"),
    meta: { title: "Drag Box" },
  },
  {
    path: "/pretext-demo",
    name: "pretextDemo",
    component: () => import("@/views/labs/PretextDemo.vue"),
    meta: { title: "Pretext Demo" },
  },
  {
    path: "/soybean-ui-demo",
    name: "soybean-ui-demo",
    component: () => import("@/views/labs/SoybeanUIDemo.vue"),
    meta: { title: "SoybeanUI Demo" },
  },
  {
    path: "/cs-items",
    name: "cs-items",
    component: () => import("@/views/csgo/CSItems.vue"),
    meta: { title: "CS Items" },
  },
  {
    path: "/inventory-monitor",
    name: "inventory-monitor",
    component: () => import("@/views/csgo/InventoryMonitor.vue"),
    meta: { title: "库存监控" },
  },
  {
    path: "/knife-market",
    name: "knife-market",
    component: () => import("@/views/csgo/KnifeMarket.vue"),
    meta: { title: "挂刀行情" },
  },
  {
    path: "/item-ranking",
    name: "item-ranking",
    component: () => import("@/views/csgo/ItemRanking.vue"),
    meta: { title: "饰品排行榜" },
  },
  {
    path: "/CsItemDetail",
    name: "CsItemDetail",
    component: () => import("@/views/csgo/ItemDetail.vue"),
    meta: { title: "Item Detail" },
  },
  {
    path: "/item-list",
    name: "item-list",
    component: () => import("@/views/csgo/ItemList.vue"),
    meta: { title: "Item List" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/base/NotFound.vue"),
    meta: { title: "Not Found" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    // 教程在页面挂载后定位章节，避免路由过渡期间找不到锚点。
    if (to.name === "guide" && to.hash) {
      return false;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      };
    }

    return { top: 0 };
  },
});
