import { useState } from 'react';

export type ChatMessage = { id: number; role: 'user' | 'bot'; text: string };

export default function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function send(text: string) {
    const msg: ChatMessage = { id: Date.now(), role: 'user', text };
    setMessages((s) => [...s, msg]);
  }

  return { messages, send };
}
