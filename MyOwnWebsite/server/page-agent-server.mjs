import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import process from "node:process";
import { getArsenalSeasonData } from "./arsenal-season-service.mjs";

const apiBaseUrl = process.env.AGENT_API_BASE_URL?.replace(/\/$/, "");
const apiKey = process.env.AGENT_API_KEY;
const model = process.env.AGENT_MODEL || "gpt-5.6-sol";
const host = process.env.AGENT_SERVER_HOST || "127.0.0.1";
const port = Number(process.env.AGENT_SERVER_PORT || 8787);
const continuations = new Map();
const continuationTtlMs = 5 * 60 * 1000;
const maxImageBytes = 4 * 1024 * 1024;
const maxBodyBytes = 8 * 1024 * 1024;
const imageDataUrlPattern = /^data:image\/(?:jpeg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/;

const destinations = [
  "/",
  "/about",
  "/blog",
  "/ecommerce",
  "/data-visualization",
  "/drag-box",
  "/pretext-demo",
  "/soybean-ui-demo",
  "/cs-items",
  "/inventory-monitor",
  "/knife-market",
  "/item-ranking",
  "/item-list",
  "/profile",
  "/chat-room",
  "/login",
];

const tools = [
  {
    type: "function",
    name: "navigate",
    description: "Navigate to one allowed route in this website.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", enum: destinations },
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "scroll_page",
    description: "Scroll the current page in a safe direction.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        direction: {
          type: "string",
          enum: ["top", "bottom", "up", "down"],
        },
      },
      required: ["direction"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "go_back",
    description: "Return to the previous browser history entry.",
    strict: true,
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "describe_page",
    description: "Read a safe summary of the current page.",
    strict: true,
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
];

const systemInstructions = `You are Codex embedded as a page agent in a Vue website.
Reply in Simplified Chinese unless the user clearly requests another language.
Use the provided tools when the user asks to navigate, scroll, go back, or inspect the page.
Never claim an action succeeded before receiving its function_call_output.
Only use provided tools. Never invent routes, tools, credentials, or destructive actions.
For general questions, answer directly and concisely without calling a tool.
Do not request, reveal, or repeat secrets.`;

const sendJson = (response, statusCode, value, cacheControl = "no-store") => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(value));
};

const readJsonBody = (request) => new Promise((resolve, reject) => {
  const chunks = [];
  let receivedBytes = 0;

  request.on("data", (chunk) => {
    receivedBytes += chunk.length;
    if (receivedBytes > maxBodyBytes) {
      reject(new Error("REQUEST_TOO_LARGE"));
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });

  request.on("end", () => {
    try {
      resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
    }
    catch {
      reject(new Error("INVALID_JSON"));
    }
  });

  request.on("error", reject);
});

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-10)
    .filter((message) =>
      message
      && (message.role === "user" || message.role === "assistant")
      && typeof message.content === "string"
      && message.content.trim(),
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));
};

const buildInstructions = (context) => {
  const safeContext = {
    path: typeof context?.path === "string" ? context.path.slice(0, 200) : "/",
    title: typeof context?.title === "string" ? context.title.slice(0, 200) : "",
    headings: Array.isArray(context?.headings)
      ? context.headings.filter((item) => typeof item === "string").slice(0, 8)
      : [],
  };

  return `${systemInstructions}\nCurrent page context: ${JSON.stringify(safeContext)}`;
};

const normalizeImage = (image) => {
  if (image === undefined || image === null) {
    return null;
  }

  const dataUrl = typeof image?.dataUrl === "string" ? image.dataUrl : "";
  const match = imageDataUrlPattern.exec(dataUrl);
  if (!match) {
    const error = new Error("Image must be a base64 data URL in JPEG, PNG, WEBP, or GIF format.");
    error.code = "INVALID_IMAGE";
    throw error;
  }

  const base64Payload = match[1];
  const padding = base64Payload.endsWith("==") ? 2 : base64Payload.endsWith("=") ? 1 : 0;
  const estimatedBytes = Math.floor(base64Payload.length * 3 / 4) - padding;
  if (estimatedBytes > maxImageBytes) {
    const error = new Error("Image must be 4 MB or smaller.");
    error.code = "INVALID_IMAGE";
    throw error;
  }

  const detail = image.detail === "low" || image.detail === "high" ? image.detail : "auto";
  return {
    type: "input_image",
    image_url: dataUrl,
    detail,
  };
};

const buildUserInput = (message, image) => {
  if (!image) {
    return { role: "user", content: message };
  }

  return {
    role: "user",
    content: [
      { type: "input_text", text: message },
      image,
    ],
  };
};

const callProvider = async ({ input, instructions }) => {
  if (!apiBaseUrl || !apiKey) {
    const error = new Error("Page Agent server is not configured.");
    error.code = "AGENT_NOT_CONFIGURED";
    throw error;
  }

  const response = await fetch(`${apiBaseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      tools,
      tool_choice: "auto",
      max_output_tokens: 800,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    let providerMessage = `Provider request failed with status ${response.status}.`;
    try {
      const body = await response.json();
      const message = body?.error?.message;
      if (typeof message === "string" && message.trim()) {
        providerMessage = message.trim().slice(0, 300);
      }
    }
    catch {
      // Keep the status-based message when the provider returns non-JSON data.
    }

    const error = new Error(providerMessage);
    error.code = "PROVIDER_ERROR";
    error.status = response.status;
    throw error;
  }

  return response.json();
};

const extractText = (providerResponse) => {
  if (typeof providerResponse.output_text === "string") {
    return providerResponse.output_text.trim();
  }

  return (providerResponse.output || [])
    .filter((item) => item.type === "message")
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join("\n");
};

const extractToolCalls = (providerResponse) => (providerResponse.output || [])
  .filter((item) => item.type === "function_call")
  .map((item) => ({
    callId: item.call_id,
    name: item.name,
    arguments: item.arguments,
  }))
  .filter((item) =>
    typeof item.callId === "string"
    && tools.some((tool) => tool.name === item.name)
    && typeof item.arguments === "string",
  );

const cleanExpiredContinuations = () => {
  const threshold = Date.now() - continuationTtlMs;
  for (const [id, state] of continuations) {
    if (state.createdAt < threshold) {
      continuations.delete(id);
    }
  }
};

const toClientResponse = ({ providerResponse, instructions, input, continuationId }) => {
  const toolCalls = extractToolCalls(providerResponse);
  const reply = extractText(providerResponse);

  if (toolCalls.length > 0) {
    const nextId = continuationId || randomUUID();
    continuations.set(nextId, {
      createdAt: Date.now(),
      instructions,
      input: [...input, ...(providerResponse.output || [])],
      pendingCallIds: new Set(toolCalls.map((call) => call.callId)),
    });

    return {
      continuationId: nextId,
      model: providerResponse.model || model,
      reply,
      toolCalls,
    };
  }

  if (continuationId) {
    continuations.delete(continuationId);
  }

  return {
    model: providerResponse.model || model,
    reply: reply || "Codex 没有返回可显示的文本。",
    toolCalls: [],
  };
};

const handleInitialRequest = async (body) => {
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 4000) {
    const error = new Error("Message must contain 1 to 4000 characters.");
    error.code = "INVALID_MESSAGE";
    throw error;
  }

  const instructions = buildInstructions(body.context);
  const image = normalizeImage(body.image);
  const input = [
    ...normalizeHistory(body.history),
    buildUserInput(message, image),
  ];
  const providerResponse = await callProvider({ input, instructions });
  return toClientResponse({ providerResponse, instructions, input });
};

const handleContinuationRequest = async (body) => {
  const continuationId = typeof body.continuationId === "string"
    ? body.continuationId
    : "";
  const state = continuations.get(continuationId);
  if (!state) {
    const error = new Error("The tool continuation expired or is invalid.");
    error.code = "INVALID_CONTINUATION";
    throw error;
  }

  const outputs = Array.isArray(body.outputs) ? body.outputs : [];
  const validOutputs = outputs
    .filter((output) =>
      output
      && typeof output.callId === "string"
      && state.pendingCallIds.has(output.callId),
    )
    .map((output) => ({
      type: "function_call_output",
      call_id: output.callId,
      output: JSON.stringify(output.result ?? { success: false }),
    }));

  if (validOutputs.length !== state.pendingCallIds.size) {
    const error = new Error("Tool outputs do not match the pending calls.");
    error.code = "INVALID_TOOL_OUTPUTS";
    throw error;
  }

  const input = [...state.input, ...validOutputs];
  const providerResponse = await callProvider({
    input,
    instructions: state.instructions,
  });

  return toClientResponse({
    continuationId,
    input,
    instructions: state.instructions,
    providerResponse,
  });
};

const server = createServer(async (request, response) => {
  cleanExpiredContinuations();

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      configured: Boolean(apiBaseUrl && apiKey),
      model,
      status: "ok",
    });
    return;
  }

  if (request.method === "GET" && request.url === "/api/football/arsenal-season") {
    try {
      const result = await getArsenalSeasonData();
      sendJson(response, 200, result, "public, max-age=60, stale-if-error=86400");
    }
    catch (error) {
      console.error(`[arsenal-season] ${error.message}`);
      sendJson(response, 502, {
        error: {
          code: "ARSENAL_DATA_UNAVAILABLE",
          message: "阿森纳赛程数据暂时不可用。",
        },
      });
    }
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 404, { error: { code: "NOT_FOUND", message: "Not found." } });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const result = request.url === "/api/agent"
      ? await handleInitialRequest(body)
      : request.url === "/api/agent/continue"
        ? await handleContinuationRequest(body)
        : null;

    if (!result) {
      sendJson(response, 404, { error: { code: "NOT_FOUND", message: "Not found." } });
      return;
    }

    sendJson(response, 200, result);
  }
  catch (error) {
    const statusCode = error.code === "INVALID_MESSAGE"
      || error.code === "INVALID_JSON"
      || error.code === "INVALID_IMAGE"
      || error.code === "INVALID_CONTINUATION"
      || error.code === "INVALID_TOOL_OUTPUTS"
      || error.message === "REQUEST_TOO_LARGE"
      ? 400
      : error.code === "AGENT_NOT_CONFIGURED"
        ? 503
        : 502;

    console.error(`[page-agent] ${error.code || "UNEXPECTED_ERROR"}: ${error.message}`);
    sendJson(response, statusCode, {
      error: {
        code: error.code || "AGENT_REQUEST_FAILED",
        message: statusCode >= 500
          ? "Codex 服务暂时不可用。"
          : error.message,
      },
    });
  }
});

server.listen(port, host, () => {
  console.log(`[page-agent] listening on http://${host}:${port} with model ${model}`);
});
