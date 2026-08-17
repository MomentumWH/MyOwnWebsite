import { afterEach, describe, expect, it, vi } from "vitest";
import { continueAgent, requestAgent } from "./pageAgentClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pageAgentClient", () => {
  it("sends page context and parses a tool call", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      continuationId: "continuation-1",
      model: "gpt-5.6-sol",
      reply: "",
      toolCalls: [{
        callId: "call-1",
        name: "navigate",
        arguments: JSON.stringify({ path: "/blog" }),
      }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestAgent(
      "打开博客",
      { path: "/", title: "首页", headings: ["欢迎"] },
      [{ role: "assistant", content: "你好" }],
    );

    expect(result.toolCalls[0]).toMatchObject({ name: "navigate" });
    expect(fetchMock).toHaveBeenCalledWith("/api/agent", expect.objectContaining({
      method: "POST",
      body: expect.stringContaining("打开博客"),
    }));
  });

  it("posts tool outputs to the continuation endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      model: "gpt-5.6-sol",
      reply: "已打开博客。",
      toolCalls: [],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await continueAgent("continuation-1", [{
      callId: "call-1",
      result: { success: true, path: "/blog" },
    }]);

    expect(result.reply).toBe("已打开博客。");
    expect(fetchMock).toHaveBeenCalledWith("/api/agent/continue", expect.objectContaining({
      body: expect.stringContaining("continuation-1"),
    }));
  });

  it("includes a selected image as a multimodal request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      model: "gpt-5.6-sol",
      reply: "这是一张测试图片。",
      toolCalls: [],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await requestAgent(
      "请描述这张图片",
      { path: "/", title: "首页", headings: [] },
      [],
      { dataUrl: "data:image/png;base64,ZmFrZQ==", detail: "auto" },
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/agent", expect.objectContaining({
      body: expect.stringContaining("data:image/png;base64,ZmFrZQ=="),
    }));
  });

  it("rejects tool names outside the browser whitelist", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      model: "gpt-5.6-sol",
      reply: "",
      toolCalls: [{ callId: "call-1", name: "run_shell", arguments: "{}" }],
    }), { status: 200 })));

    await expect(requestAgent(
      "执行命令",
      { path: "/", title: "首页", headings: [] },
      [],
    )).rejects.toThrow("无效工具调用");
  });

  it("surfaces the sanitized server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { message: "Codex 服务暂时不可用。" },
    }), { status: 502 })));

    await expect(requestAgent(
      "你好",
      { path: "/", title: "首页", headings: [] },
      [],
    )).rejects.toThrow("Codex 服务暂时不可用");
  });
});
