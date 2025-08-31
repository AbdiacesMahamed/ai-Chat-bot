import React, { useRef } from "react";

export default function InputBox({ onSend }: any) {
  const ref = useRef<HTMLInputElement | null>(null);
  return React.createElement(
    "div",
    { className: "input-box" },
    React.createElement("input", { ref, placeholder: "Type a message" }),
    React.createElement(
      "button",
      {
        onClick: () => {
          const v = ref.current?.value?.trim();
          if (!v) return;
          ref.current!.value = "";
          onSend(v);
        },
      },
      "Send"
    )
  );
}
