import { z } from "zod";
import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { readMemory, addMemory } from "../src/backend/memory";

// Lazy model creation so importing this module doesn't throw if API key isn't set
let _model: any = null;
function getModel(): any {
  if (_model) return _model;
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error(
      "Please set an API key in GEMINI_API_KEY or GOOGLE_API_KEY environment variable"
    );
  }
  _model = new ChatGoogleGenerativeAI({
    apiKey: key,
    temperature: 0,
    model: "gemini-2.0-flash",
  });
  return _model;
}

export async function* streamAssistant(input: string): AsyncGenerator<string> {
  const model = getModel();
  // Use the model.stream API which yields chunks; adapt to a simple string stream.
  const stream = await (model as any).stream(input);
  for await (const chunk of stream) {
    // Some implementations provide chunk.content or chunk.text
    const text = chunk?.content ?? chunk?.text ?? String(chunk);
    yield text;
  }
}

export async function callAssistant(input: string): Promise<string> {
  const model = getModel();
  // Non-streaming helper for convenience.
  if (typeof (model as any).invoke === "function") {
    const res = await (model as any).invoke(input);
    return res?.content ?? res?.text ?? String(res);
  }

  if (typeof (model as any).call === "function") {
    const msg = new AIMessage(input);
    const res = await (model as any).call([msg]);
    return res?.text ?? res?.content ?? "";
  }

  throw new Error("No compatible method on ChatGoogleGenerativeAI instance.");
}

// Memory is provided by src/backend/memory index (readMemory/addMemory).

// Helpers that include memory in prompts
export async function callAssistantWithMemory(
  input: string,
  sessionId?: string
) {
  const mem = sessionId ? readMemory(sessionId).join("\n") : "";
  const prompt = mem ? `${mem}\nUser: ${input}` : `User: ${input}`;
  const out = await callAssistant(prompt);
  if (sessionId) {
    addMemory(sessionId, `User: ${input}`);
    addMemory(sessionId, `Assistant: ${out}`);
  }
  return out;
}

export async function* streamAssistantWithMemory(
  input: string,
  sessionId?: string
): AsyncGenerator<string> {
  const mem = sessionId ? readMemory(sessionId).join("\n") : "";
  const prompt = mem ? `${mem}\nUser: ${input}` : `User: ${input}`;
  const stream = streamAssistant(prompt);
  let full = "";
  for await (const chunk of stream) {
    full += chunk;
    yield chunk;
  }
  if (sessionId) {
    addMemory(sessionId, `User: ${input}`);
    addMemory(sessionId, `Assistant: ${full}`);
  }
}
