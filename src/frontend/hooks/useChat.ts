import { useState } from "react";

type Message = { role: string; text: string };

export default function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  async function send(input: string) {
    setMessages((m) => [
      ...m,
      { role: "user", text: input },
      { role: "assistant", text: "" },
    ]);

    // get or create sessionId (guard localStorage for build/SSR environments)
    const storage =
      typeof globalThis !== "undefined" && (globalThis as any).localStorage
        ? (globalThis as any).localStorage
        : null;
    let sessionId = storage ? storage.getItem("sessionId") : null;
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2);
      if (storage) storage.setItem("sessionId", sessionId);
    }

    const resp = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, sessionId }),
    });

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let partial = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      partial += decoder.decode(value, { stream: true });
      const parts = partial.split("\n\n");
      for (let i = 0; i < parts.length - 1; i++) {
        const chunk = parts[i];
        if (chunk.startsWith("data: ")) {
          const data = chunk.slice(6);
          let text = data;
          try {
            text = JSON.parse(data);
          } catch {}
          setMessages((prev) => {
            const copy = [...prev];
            for (let j = copy.length - 1; j >= 0; j--) {
              if (copy[j].role === "assistant") {
                copy[j] = { ...copy[j], text: copy[j].text + text };
                break;
              }
            }
            return copy;
          });
        }
      }
      partial = parts[parts.length - 1];
    }
  }

  return { messages, send };
}
