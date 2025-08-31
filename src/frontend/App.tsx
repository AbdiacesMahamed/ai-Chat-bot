import React from "react";
import ChatWindow from "./components/ChatWindow";
import useChat from "./hooks/useChat";
import "./styles.css";

export default function App() {
  const { messages, send } = useChat();

  return (
    <div className="app-root">
      <h1 className="title">Simple Chat</h1>
      <ChatWindow messages={messages} onSend={send} />
    </div>
  );
}
