import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";

/** 应用级路由路径 */
export const PermissionPaths = {
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",
  CHAT_ROOM: "/chat-room",
} as const;

/** localStorage 中认证相关键名 */
export const AuthStorageKeys = {
  TOKEN: "auth_token",
  USER: "auth_user",
} as const;

/** 无需登录即可访问的路由 path（与 router 中 record.path 一致） */
export const ROUTE_WHITE_LIST = new Set<string>([
  PermissionPaths.LOGIN,
  PermissionPaths.HOME,
  "/cs-items",
  "/item-list",
  "/CsItemDetail",
  "/blog",
  "/ecommerce",
  "/data-visualization",
  "/drag-box",
  "/about",
]);

export type UserRole = "admin" | "user";

export interface AuthUser {
  username: string;
  role: UserRole;
}

/** 功能级权限码，便于后续扩展 RBAC */
export type PermissionCode = "chat-room:access";

const CHAT_ROOM_ALLOWED_USERNAMES = new Set(["admin", "Chonny"]);

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<PermissionCode>> = {
  admin: new Set(["chat-room:access"]),
  user: new Set(),
};

/** 是否已登录（仅以 token 是否存在为准，与路由守卫一致） */
export function isLoggedIn(token: string | null | undefined): boolean {
  return Boolean(token);
}

/** 路由是否在白名单内 */
export function isWhiteListedRoute(to: RouteLocationNormalized): boolean {
  return to.matched.some((record) => ROUTE_WHITE_LIST.has(record.path));
}

/** 路由是否声明需要登录（meta）或不在白名单 */
export function routeRequiresAuth(to: RouteLocationNormalized): boolean {
  return (
    !isWhiteListedRoute(to)
    || to.matched.some((record) => record.meta.requiresAuth === true)
  );
}

/** 路由是否声明需要聊天室权限 */
export function routeRequiresChatRoomAccess(
  to: RouteLocationNormalized,
): boolean {
  return to.matched.some(
    (record) => record.meta.requiresChatRoomAccess === true,
  );
}

/** 用户是否拥有指定权限码 */
export function hasPermission(
  user: AuthUser | null | undefined,
  code: PermissionCode,
): boolean {
  if (!user) {
    return false;
  }

  if (ROLE_PERMISSIONS[user.role]?.has(code)) {
    return true;
  }

  if (code === "chat-room:access") {
    return CHAT_ROOM_ALLOWED_USERNAMES.has(user.username);
  }

  return false;
}

/** 是否可访问聊天室 */
export function canAccessChatRoom(
  user: AuthUser | null | undefined,
): boolean {
  return hasPermission(user, "chat-room:access");
}

export interface AuthContext {
  token: string | null;
  user: AuthUser | null;
}

export type NavigationGuardRedirect = RouteLocationRaw & { replace?: boolean };

export type NavigationGuardResult = true | NavigationGuardRedirect;

/**
 * 根据当前认证上下文与目标路由，计算导航守卫应返回的结果。
 * 供 router.beforeEach 调用。
 */
export function resolveNavigationGuard(
  to: RouteLocationNormalized,
  ctx: AuthContext,
): NavigationGuardResult {
  const loggedIn = isLoggedIn(ctx.token);

  if (to.path === PermissionPaths.LOGIN && loggedIn) {
    return { path: PermissionPaths.HOME, replace: true };
  }

  if (routeRequiresAuth(to) && !loggedIn) {
    return {
      path: PermissionPaths.LOGIN,
      query: { redirect: to.fullPath },
      replace: true,
    };
  }

  if (routeRequiresChatRoomAccess(to) && !canAccessChatRoom(ctx.user)) {
    return { path: PermissionPaths.HOME, replace: true };
  }

  return true;
}

/** 登录成功后安全解析 redirect 目标 */
export function resolvePostLoginRedirect(
  redirect: unknown,
  fallback: string = PermissionPaths.HOME,
): string {
  if (typeof redirect === "string" && redirect && redirect !== PermissionPaths.LOGIN) {
    return redirect;
  }
  return fallback;
}
