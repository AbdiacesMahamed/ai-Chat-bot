import React from "react";
import MessageItem from "./MessageItem";

export default function MessageList({ messages }: any) {
  return React.createElement(
    "div",
    { className: "message-list" },
    messages.map((m: any, i: number) =>
      React.createElement(MessageItem, { key: i, role: m.role, text: m.text })
    )
  );
}
