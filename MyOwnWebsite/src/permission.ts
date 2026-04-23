import { router } from "./router/index";
import { useAuthStore } from "./stores/auth";

const whiteList = [
  "/login",
  "/",
  "/cs-items",
  "/item-list",
  "/CsItemDetail",
  "/blog",
  "/ecommerce",
  "/data-visualization",
  "/drag-box",
  "/about",
];

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated) {
    authStore.initAuth();
  }

  if (to.meta.title) {
    document.title = `${to.meta.title} - CS饰品`;
  }

  const hasToken = Boolean(authStore.token);

  if (hasToken) {
    if (to.path === "/login") {
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
  }
});

router.afterEach(() => {
});
