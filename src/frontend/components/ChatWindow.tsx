import React from "react";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import PlaywrightButton from "./PlaywrightButton";

export default function ChatWindow({ messages, onSend }: any) {
  return React.createElement(
    "div",
    { className: "chat-window" },
    React.createElement(MessageList, { messages }),
    React.createElement(InputBox, { onSend }),
    React.createElement(PlaywrightButton, null)
  );
}
