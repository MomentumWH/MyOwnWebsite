import type { RouteLocationNormalized } from "vue-router";
import { router } from "./router/index";
import { useAuthStore } from "./stores/auth";

const APP_TITLE = "CS饰品";
const HOME_PATH = "/";
const LOGIN_PATH = "/login";
const WHITE_LIST = new Set([
  LOGIN_PATH,
  HOME_PATH,
  "/cs-items",
  "/item-list",
  "/CsItemDetail",
  "/blog",
  "/ecommerce",
  "/data-visualization",
  "/drag-box",
  "/about",
]);

const isWhiteListedRoute = (to: RouteLocationNormalized) =>
  to.matched.some((record) => WHITE_LIST.has(record.path));

const requiresChatRoomAccess = (to: RouteLocationNormalized) =>
  to.matched.some((record) => record.meta.requiresChatRoomAccess);

const requiresAuth = (to: RouteLocationNormalized) =>
  !isWhiteListedRoute(to) ||
  to.matched.some((record) => record.meta.requiresAuth);

router.beforeEach((to) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  const hasToken = Boolean(authStore.token);

  if (to.path === LOGIN_PATH && hasToken) {
    return { path: HOME_PATH, replace: true };
  }

  if (requiresAuth(to) && !hasToken) {
    return {
      path: LOGIN_PATH,
      query: { redirect: to.fullPath },
      replace: true,
    };
  }

  if (requiresChatRoomAccess(to) && !authStore.canAccessChatRoom) {
    return { path: HOME_PATH, replace: true };
  }

  return true;
});

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === "string" ? to.meta.title : "";
  document.title = pageTitle ? `${pageTitle} - ${APP_TITLE}` : APP_TITLE;
});
