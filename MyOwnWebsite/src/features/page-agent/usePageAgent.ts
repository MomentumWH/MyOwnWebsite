import type { RouteLocationNormalizedLoadedGeneric, Router } from "vue-router";
import { readonly, ref, shallowRef } from "vue";
import {
  continueAgent,
  requestAgent,
  type PageAgentContext,
  type PageAgentHistoryItem,
  type PageAgentToolCall,
  type PageAgentToolOutput,
} from "./pageAgentClient";
import {
  PAGE_AGENT_DESTINATIONS,
  resolvePageAgentIntent,
  type PageAgentMessageImage,
  type PageAgentMessage,
} from "./pageAgent";

export interface UsePageAgentOptions {
  router: Router;
  route: RouteLocationNormalizedLoadedGeneric;
}

export type PageAgentMode = "codex" | "local";

let messageSequence = 0;
const maxImageBytes = 4 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const createMessage = (
  role: PageAgentMessage["role"],
  content: string,
  image?: PageAgentMessageImage,
): PageAgentMessage => ({
  id: `page-agent-${Date.now()}-${messageSequence++}`,
  role,
  content,
  ...(image ? { image } : {}),
});

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getVisibleHeadings = () => Array.from(
  document.querySelectorAll<HTMLElement>("main h1, main h2, header h1"),
)
  .filter((heading) => heading.offsetParent !== null)
  .map((heading) => heading.textContent?.replace(/\s+/g, " ").trim())
  .filter((heading): heading is string => Boolean(heading));

const getPageContext = (route: RouteLocationNormalizedLoadedGeneric): PageAgentContext => ({
  path: route.path,
  title: typeof route.meta.title === "string"
    ? route.meta.title
    : document.title || "当前页面",
  headings: [...new Set(getVisibleHeadings())].slice(0, 8),
});

const getPageOverview = (route: RouteLocationNormalizedLoadedGeneric) => {
  const context = getPageContext(route);
  const visibleActions = Array.from(
    document.querySelectorAll<HTMLElement>("main a[href], main button"),
  ).filter((element) =>
    element.offsetParent !== null && !element.hasAttribute("disabled"),
  ).length;
  const headingSummary = context.headings.length > 0
    ? `主要内容包括：${context.headings.slice(0, 4).join("、")}。`
    : "当前页面没有可读取的主标题。";

  return `你正在浏览“${context.title}”（${context.path}）。${headingSummary}页面中目前有 ${visibleActions} 个可见的链接或按钮。`;
};

export function usePageAgent({ router, route }: UsePageAgentOptions) {
  const isOpen = shallowRef(false);
  const isRunning = shallowRef(false);
  const draft = shallowRef("");
  const agentMode = shallowRef<PageAgentMode>("codex");
  const selectedImage = shallowRef<PageAgentMessageImage | null>(null);
  const imageError = shallowRef("");
  const isImageLoading = shallowRef(false);
  const streamingMessageId = shallowRef<string | null>(null);
  const messages = ref<PageAgentMessage[]>([
    createMessage(
      "agent",
      "我是由 Codex 驱动的页面 Agent。你可以让我回答问题、打开站内页面、返回上一页、上下浏览，或概览当前页面。",
    ),
  ]);
  const allowedPaths = new Set(PAGE_AGENT_DESTINATIONS.map((item) => item.path));

  const appendMessage = (
    role: PageAgentMessage["role"],
    content: string,
    image?: PageAgentMessageImage,
  ) => {
    messages.value.push(createMessage(role, content, image));
  };

  const appendAgentReply = async (content: string) => {
    const message = createMessage("agent", "");
    messages.value.push(message);

    if (!content || prefersReducedMotion()) {
      message.content = content;
      return;
    }

    const characters = Array.from(content);
    const duration = Math.min(3800, Math.max(650, characters.length * 15));
    const startedAt = performance.now();
    streamingMessageId.value = message.id;

    await new Promise<void>((resolve) => {
      const reveal = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const characterCount = Math.ceil(characters.length * progress);
        message.content = characters.slice(0, characterCount).join("");

        if (progress >= 1) {
          resolve();
          return;
        }

        requestAnimationFrame(reveal);
      };

      requestAnimationFrame(reveal);
    });

    streamingMessageId.value = null;
  };

  const clearImage = () => {
    selectedImage.value = null;
    imageError.value = "";
  };

  const readImageDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      }
      else {
        reject(new Error("无法读取图片内容。"));
      }
    }, { once: true });
    reader.addEventListener("error", () => reject(new Error("无法读取图片内容。")), { once: true });
    reader.readAsDataURL(file);
  });

  const handleImageSelected = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    imageError.value = "";

    if (!file) {
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      imageError.value = "请选择 JPG、PNG、WEBP 或 GIF 图片。";
      return;
    }

    if (file.size > maxImageBytes) {
      imageError.value = "图片大小不能超过 4 MB。";
      return;
    }

    isImageLoading.value = true;
    try {
      selectedImage.value = {
        dataUrl: await readImageDataUrl(file),
        name: file.name,
      };
    }
    catch (error) {
      console.warn("Page agent image selection failed:", error);
      imageError.value = "图片读取失败，请重新选择。";
    }
    finally {
      isImageLoading.value = false;
    }
  };

  const scrollPage = (direction: "top" | "bottom" | "up" | "down") => {
    const behavior = prefersReducedMotion() ? "auto" : "smooth";

    if (direction === "top" || direction === "bottom") {
      window.scrollTo({
        top: direction === "top" ? 0 : document.documentElement.scrollHeight,
        behavior,
      });
      return direction === "top" ? "已返回页面顶部。" : "已滚动到页面底部。";
    }

    window.scrollBy({
      top: window.innerHeight * (direction === "down" ? 0.72 : -0.72),
      behavior,
    });
    return direction === "down" ? "已向下浏览一屏。" : "已向上浏览一屏。";
  };

  const executeTool = async (toolCall: PageAgentToolCall): Promise<PageAgentToolOutput> => {
    const failed = (message: string): PageAgentToolOutput => ({
      callId: toolCall.callId,
      result: { success: false, message },
    });

    let args: unknown;
    try {
      args = JSON.parse(toolCall.arguments);
    }
    catch {
      return failed("工具参数不是有效的 JSON。");
    }

    const parsedArgs = typeof args === "object" && args !== null
      ? args as Record<string, unknown>
      : {};

    if (toolCall.name === "navigate") {
      const path = parsedArgs.path;
      if (typeof path !== "string" || !allowedPaths.has(path)) {
        return failed("目标路径不在允许的站内页面白名单中。");
      }

      if (router.currentRoute.value.path === path) {
        return {
          callId: toolCall.callId,
          result: { success: true, path, message: "用户已经位于目标页面。" },
        };
      }

      await router.push(path);
      const currentPath = router.currentRoute.value.path;
      return {
        callId: toolCall.callId,
        result: {
          success: currentPath === path,
          path: currentPath,
          message: currentPath === path
            ? "站内导航成功。"
            : "路由守卫将用户转到了其他页面。",
        },
      };
    }

    if (toolCall.name === "scroll_page") {
      const direction = parsedArgs.direction;
      if (
        direction !== "top"
        && direction !== "bottom"
        && direction !== "up"
        && direction !== "down"
      ) {
        return failed("滚动方向不在允许范围内。");
      }

      return {
        callId: toolCall.callId,
        result: { success: true, message: scrollPage(direction) },
      };
    }

    if (toolCall.name === "go_back") {
      router.back();
      return {
        callId: toolCall.callId,
        result: { success: true, message: "已请求返回上一页。" },
      };
    }

    if (toolCall.name === "describe_page") {
      return {
        callId: toolCall.callId,
        result: { success: true, overview: getPageOverview(router.currentRoute.value) },
      };
    }

    return failed("不支持这个页面工具。");
  };

  const runLocalFallback = async (prompt: string, hasImage = false) => {
    if (hasImage) {
      await appendAgentReply("图片已添加，但 Codex 服务暂时不可用，本地模式无法分析图片。请稍后重试。");
      return;
    }

    const intent = resolvePageAgentIntent(prompt);

    if (intent.type === "navigate") {
      if (route.path === intent.destination.path) {
        await appendAgentReply(`你已经在“${intent.destination.label}”了。`);
        return;
      }

      await router.push(intent.destination.path);

      if (route.path !== intent.destination.path) {
        const finalTitle = typeof route.meta.title === "string"
          ? route.meta.title
          : route.path;
        await appendAgentReply(
          `Codex 暂时不可用，已通过本地规则执行。目标页面需要额外权限，站点转到了“${finalTitle}”（${route.path}）。`,
        );
        return;
      }

      await appendAgentReply(`Codex 暂时不可用，已通过本地规则打开“${intent.destination.label}”。`);
      return;
    }

    if (intent.type === "scroll") {
      await appendAgentReply(`Codex 暂时不可用，已通过本地规则处理：${scrollPage(intent.direction)}`);
      return;
    }

    if (intent.type === "back") {
      router.back();
      await appendAgentReply("Codex 暂时不可用，已通过本地规则返回上一页。");
      return;
    }

    if (intent.type === "describe") {
      await appendAgentReply(`Codex 暂时不可用，以下是本地概览：${getPageOverview(route)}`);
      return;
    }

    await appendAgentReply(
      "Codex 服务暂时不可用，本地模式只能执行站内导航、返回、滚动和页面概览。请稍后重试一般问答。",
    );
  };

  const run = async (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? draft.value).trim();
    const image = selectedImage.value;
    if ((!prompt && !image) || isRunning.value || isImageLoading.value) {
      return;
    }

    const promptForModel = prompt || "请分析这张图片。";
    const history: PageAgentHistoryItem[] = messages.value.slice(-10).map((message) => ({
      role: message.role === "agent" ? "assistant" : "user",
      content: message.content,
    }));
    draft.value = "";
    appendMessage("user", promptForModel, image || undefined);
    clearImage();
    isRunning.value = true;
    let toolRoundStarted = false;

    try {
      let response = await requestAgent(
        promptForModel,
        getPageContext(router.currentRoute.value),
        history,
        image ? { dataUrl: image.dataUrl, detail: "auto" } : undefined,
      );
      let latestReply = response.reply;
      let rounds = 0;

      while (response.toolCalls.length > 0 && rounds < 3) {
        if (!response.continuationId) {
          throw new Error("Agent 工具调用缺少会话标识。");
        }

        toolRoundStarted = true;
        const outputs: PageAgentToolOutput[] = [];
        for (const toolCall of response.toolCalls) {
          outputs.push(await executeTool(toolCall));
        }

        response = await continueAgent(response.continuationId, outputs);
        latestReply = response.reply || latestReply;
        rounds += 1;
      }

      agentMode.value = "codex";
      await appendAgentReply(
        response.toolCalls.length > 0
          ? "为避免连续操作过多，我已停止后续页面动作。"
          : latestReply || "操作已执行完成。",
      );
    }
    catch (error) {
      console.warn("Codex page agent unavailable, using local fallback:", error);
      agentMode.value = "local";

      if (toolRoundStarted) {
        await appendAgentReply("页面动作已处理，但 Codex 未能完成后续回复，请稍后重试。");
      }
      else {
        await runLocalFallback(promptForModel, Boolean(image));
      }
    }
    finally {
      isRunning.value = false;
    }
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const close = () => {
    isOpen.value = false;
  };

  return {
    agentMode: readonly(agentMode),
    clearImage,
    close,
    draft,
    handleImageSelected,
    imageError: readonly(imageError),
    isImageLoading: readonly(isImageLoading),
    isOpen: readonly(isOpen),
    isRunning: readonly(isRunning),
    messages: readonly(messages),
    run,
    selectedImage: readonly(selectedImage),
    streamingMessageId: readonly(streamingMessageId),
    toggle,
  };
}
