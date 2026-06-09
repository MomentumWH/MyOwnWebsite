import { router } from "./router/index";
import { resolveNavigationGuard } from "./permissions";
import { useAuthStore } from "./stores/auth";

const APP_TITLE = "CS饰品";

router.beforeEach((to) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  return resolveNavigationGuard(to, {
    token: authStore.token,
    user: authStore.user,
  });
});

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === "string" ? to.meta.title : "";
  document.title = pageTitle ? `${pageTitle} - ${APP_TITLE}` : APP_TITLE;
});
