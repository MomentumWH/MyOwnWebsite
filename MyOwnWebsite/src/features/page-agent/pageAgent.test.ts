import { describe, expect, it } from "vitest";
import { resolvePageAgentIntent } from "./pageAgent";

describe("resolvePageAgentIntent", () => {
  it("resolves a route from a natural-language prompt", () => {
    expect(resolvePageAgentIntent("帮我打开库存监控")).toMatchObject({
      type: "navigate",
      destination: { path: "/inventory-monitor" },
    });
  });

  it("prefers the top action over the back action", () => {
    expect(resolvePageAgentIntent("帮我返回顶部")).toEqual({
      type: "scroll",
      direction: "top",
    });
  });

  it("recognizes page overview and history actions", () => {
    expect(resolvePageAgentIntent("这个页面有什么")).toEqual({ type: "describe" });
    expect(resolvePageAgentIntent("返回上一页")).toEqual({ type: "back" });
  });

  it("keeps unsupported requests inert", () => {
    expect(resolvePageAgentIntent("帮我删除这条数据")).toEqual({ type: "unknown" });
  });
});
