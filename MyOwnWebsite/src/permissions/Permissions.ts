import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";

/** 搴旂敤绾ц矾鐢辫矾寰?*/
export const PermissionPaths = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  CHAT_ROOM: "/chat-room",
} as const;

/** localStorage 涓璇佺浉鍏抽敭鍚?*/
export const AuthStorageKeys = {
  TOKEN: "auth_token",
  USER: "auth_user",
} as const;

/** 鏃犻渶鐧诲綍鍗冲彲璁块棶鐨勮矾鐢?path锛堜笌 router 涓?record.path 涓€鑷达級 */
export const ROUTE_WHITE_LIST = new Set<string>([
  PermissionPaths.LOGIN,
  PermissionPaths.REGISTER,
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

/** 鍔熻兘绾ф潈闄愮爜锛屼究浜庡悗缁墿灞?RBAC */
export type PermissionCode = "chat-room:access";

const CHAT_ROOM_ALLOWED_USERNAMES = new Set(["admin", "Chonny"]);

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<PermissionCode>> = {
  admin: new Set(["chat-room:access"]),
  user: new Set(),
};

/** 鏄惁宸茬櫥褰曪紙浠呬互 token 鏄惁瀛樺湪涓哄噯锛屼笌璺敱瀹堝崼涓€鑷达級 */
export function isLoggedIn(token: string | null | undefined): boolean {
  return Boolean(token);
}

/** 璺敱鏄惁鍦ㄧ櫧鍚嶅崟鍐?*/
export function isWhiteListedRoute(to: RouteLocationNormalized): boolean {
  return to.matched.some((record) => ROUTE_WHITE_LIST.has(record.path));
}

/** 璺敱鏄惁澹版槑闇€瑕佺櫥褰曪紙meta锛夋垨涓嶅湪鐧藉悕鍗?*/
export function routeRequiresAuth(to: RouteLocationNormalized): boolean {
  return (
    !isWhiteListedRoute(to)
    || to.matched.some((record) => record.meta.requiresAuth === true)
  );
}

/** 璺敱鏄惁澹版槑闇€瑕佽亰澶╁鏉冮檺 */
export function routeRequiresChatRoomAccess(
  to: RouteLocationNormalized,
): boolean {
  return to.matched.some(
    (record) => record.meta.requiresChatRoomAccess === true,
  );
}

/** 鐢ㄦ埛鏄惁鎷ユ湁鎸囧畾鏉冮檺鐮?*/
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

/** 鏄惁鍙闂亰澶╁ */
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
 * 鏍规嵁褰撳墠璁よ瘉涓婁笅鏂囦笌鐩爣璺敱锛岃绠楀鑸畧鍗簲杩斿洖鐨勭粨鏋溿€? * 渚?router.beforeEach 璋冪敤銆? */
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

/** 鐧诲綍鎴愬姛鍚庡畨鍏ㄨВ鏋?redirect 鐩爣 */
export function resolvePostLoginRedirect(
  redirect: unknown,
  fallback: string = PermissionPaths.HOME,
): string {
  if (typeof redirect === "string" && redirect && redirect !== PermissionPaths.LOGIN) {
    return redirect;
  }
  return fallback;
}


