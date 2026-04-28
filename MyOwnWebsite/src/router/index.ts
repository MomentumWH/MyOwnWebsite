import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/account/Login.vue"),
    meta: { title: "Login" },
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
    path: "/cs-items",
    name: "cs-items",
    component: () => import("@/views/csgo/CSItems.vue"),
    meta: { title: "CS Items" },
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
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
