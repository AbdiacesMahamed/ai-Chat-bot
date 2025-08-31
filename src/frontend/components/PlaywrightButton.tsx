import React, { useState } from "react";

export default function PlaywrightButton() {
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setScreenshot(null);
    try {
      const r = await fetch("/api/playwright/open-youtube", { method: "POST" });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "unknown");
      setScreenshot(j.screenshotPath);
    } catch (e: any) {
      setError(String(e));
    }
    setLoading(false);
  }

  return React.createElement(
    "div",
    { style: { marginTop: 12 } },
    React.createElement(
      "button",
      { onClick: run, disabled: loading, style: { padding: "8px 12px" } },
      loading ? "Opening..." : "Open YouTube (Playwright)"
    ),
    error &&
      React.createElement(
        "div",
        { style: { color: "crimson", marginTop: 8 } },
        error
      ),
    screenshot &&
      React.createElement(
        "div",
        { style: { marginTop: 8 } },
        React.createElement("div", null, "Screenshot:"),
        React.createElement("img", {
          src: screenshot,
          alt: "s",
          style: { maxWidth: "100%", border: "1px solid #ddd", marginTop: 6 },
        })
      )
  );
}
