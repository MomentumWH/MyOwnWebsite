import { describe, expect, it } from "vitest";
import type { RouteLocationNormalized } from "vue-router";
import {
  PermissionPaths,
  canAccessChatRoom,
  isLoggedIn,
  isWhiteListedRoute,
  resolveNavigationGuard,
  resolvePostLoginRedirect,
  routeRequiresAuth,
} from "./Permissions";

function mockRoute(
  path: string,
  meta: Record<string, unknown> = {},
): RouteLocationNormalized {
  return {
    path,
    fullPath: path,
    matched: [{ path, meta } as never],
  } as RouteLocationNormalized;
}

describe("permissions", () => {
  describe("isLoggedIn", () => {
    it("returns false when token is empty", () => {
      expect(isLoggedIn(null)).toBe(false);
      expect(isLoggedIn("")).toBe(false);
    });

    it("returns true when token exists", () => {
      expect(isLoggedIn("mock-token")).toBe(true);
    });
  });

  describe("canAccessChatRoom", () => {
    it("allows admin role and whitelisted usernames", () => {
      expect(canAccessChatRoom({ username: "admin", role: "admin" })).toBe(true);
      expect(canAccessChatRoom({ username: "Chonny", role: "user" })).toBe(true);
    });

    it("denies regular user without whitelist", () => {
      expect(canAccessChatRoom({ username: "test", role: "user" })).toBe(false);
      expect(canAccessChatRoom(null)).toBe(false);
    });
  });

  describe("routeRequiresAuth", () => {
    it("does not require auth for whitelisted routes", () => {
      expect(routeRequiresAuth(mockRoute("/"))).toBe(false);
      expect(routeRequiresAuth(mockRoute("/cs-items"))).toBe(false);
    });

    it("requires auth for protected routes", () => {
      expect(routeRequiresAuth(mockRoute("/profile"))).toBe(true);
      expect(routeRequiresAuth(mockRoute("/pretext-demo"))).toBe(true);
    });
  });

  describe("resolveNavigationGuard", () => {
    const guest = { token: null, user: null };
    const testUser = {
      token: "t",
      user: { username: "test", role: "user" as const },
    };
    const adminUser = {
      token: "t",
      user: { username: "admin", role: "admin" as const },
    };

    it("redirects logged-in user away from login page", () => {
      const result = resolveNavigationGuard(
        mockRoute(PermissionPaths.LOGIN),
        adminUser,
      );
      expect(result).toEqual({ path: PermissionPaths.HOME, replace: true });
    });

    it("redirects guest to login with redirect query", () => {
      const to = mockRoute("/profile");
      to.fullPath = "/profile?tab=1";
      const result = resolveNavigationGuard(to, guest);
      expect(result).toEqual({
        path: PermissionPaths.LOGIN,
        query: { redirect: "/profile?tab=1" },
        replace: true,
      });
    });

    it("redirects user without chat permission to home", () => {
      const result = resolveNavigationGuard(
        mockRoute("/chat-room", { requiresChatRoomAccess: true }),
        testUser,
      );
      expect(result).toEqual({ path: PermissionPaths.HOME, replace: true });
    });

    it("allows admin into chat room", () => {
      const result = resolveNavigationGuard(
        mockRoute("/chat-room", { requiresChatRoomAccess: true }),
        adminUser,
      );
      expect(result).toBe(true);
    });

    it("allows guest on public home", () => {
      expect(resolveNavigationGuard(mockRoute("/"), guest)).toBe(true);
    });
  });

  describe("resolvePostLoginRedirect", () => {
    it("uses redirect when valid", () => {
      expect(resolvePostLoginRedirect("/profile")).toBe("/profile");
    });

    it("falls back when redirect is login or invalid", () => {
      expect(resolvePostLoginRedirect("/login")).toBe(PermissionPaths.HOME);
      expect(resolvePostLoginRedirect(undefined)).toBe(PermissionPaths.HOME);
      expect(resolvePostLoginRedirect(["/profile"])).toBe(PermissionPaths.HOME);
    });
  });

  describe("isWhiteListedRoute", () => {
    it("recognizes whitelist paths", () => {
      expect(isWhiteListedRoute(mockRoute("/blog"))).toBe(true);
      expect(isWhiteListedRoute(mockRoute("/profile"))).toBe(false);
    });
  });
});
