export type PageAgentToolName =
  | "navigate"
  | "scroll_page"
  | "go_back"
  | "describe_page";

export interface PageAgentToolCall {
  callId: string;
  name: PageAgentToolName;
  arguments: string;
}

export interface PageAgentApiResponse {
  continuationId?: string;
  model: string;
  reply: string;
  toolCalls: PageAgentToolCall[];
}

export interface PageAgentHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface PageAgentContext {
  path: string;
  title: string;
  headings: string[];
}

export interface PageAgentImageInput {
  dataUrl: string;
  detail?: "auto" | "low" | "high";
}

export interface PageAgentToolOutput {
  callId: string;
  result: Record<string, unknown>;
}

const toolNames = new Set<PageAgentToolName>([
  "navigate",
  "scroll_page",
  "go_back",
  "describe_page",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseResponse = (value: unknown): PageAgentApiResponse => {
  if (!isRecord(value)) {
    throw new Error("Agent 服务返回了无效数据。");
  }

  const rawToolCalls = Array.isArray(value.toolCalls) ? value.toolCalls : [];
  const toolCalls = rawToolCalls.map((item) => {
    if (
      !isRecord(item)
      || typeof item.callId !== "string"
      || typeof item.name !== "string"
      || !toolNames.has(item.name as PageAgentToolName)
      || typeof item.arguments !== "string"
    ) {
      throw new Error("Agent 服务返回了无效工具调用。");
    }

    return {
      callId: item.callId,
      name: item.name as PageAgentToolName,
      arguments: item.arguments,
    };
  });

  if (typeof value.model !== "string" || typeof value.reply !== "string") {
    throw new TypeError("Agent 服务响应缺少必要字段。");
  }

  if (value.continuationId !== undefined && typeof value.continuationId !== "string") {
    throw new TypeError("Agent 服务返回了无效会话标识。");
  }

  return {
    continuationId: value.continuationId,
    model: value.model,
    reply: value.reply,
    toolCalls,
  };
};

const postJson = async (path: string, body: unknown): Promise<PageAgentApiResponse> => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(65_000),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  }
  catch {
    throw new Error("Agent 服务返回了无法解析的响应。");
  }

  if (!response.ok) {
    const message = isRecord(payload)
      && isRecord(payload.error)
      && typeof payload.error.message === "string"
      ? payload.error.message
      : "Agent 服务暂时不可用。";
    throw new Error(message);
  }

  return parseResponse(payload);
};

export const requestAgent = (
  message: string,
  context: PageAgentContext,
  history: PageAgentHistoryItem[],
  image?: PageAgentImageInput,
) => postJson("/api/agent", {
  message,
  context,
  history,
  ...(image ? { image } : {}),
});

export const continueAgent = (
  continuationId: string,
  outputs: PageAgentToolOutput[],
) => postJson("/api/agent/continue", { continuationId, outputs });
