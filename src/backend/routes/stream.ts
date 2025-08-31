import { Router } from "express";
import { streamAssistantWithMemory } from "../../../agents/agent";

const router = Router();

router.post("/", async (req, res) => {
  const input: string = req.body?.input;
  if (!input) return res.status(400).json({ error: "missing input" });

  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  const sessionId: string | undefined = req.body?.sessionId;
  try {
    for await (const chunk of streamAssistantWithMemory(input, sessionId)) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write(`event: done\ndata: true\n\n`);
    res.end();
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify(String(err))}\n\n`);
    res.end();
  }
});

export default router;
