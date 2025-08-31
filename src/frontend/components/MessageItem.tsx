import React from "react";

export default function MessageItem({ role, text }: any) {
  return React.createElement("div", { className: `message ${role}` }, text);
}
