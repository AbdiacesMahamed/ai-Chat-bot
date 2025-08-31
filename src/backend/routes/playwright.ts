import { Router } from "express";
import { openYouTube } from "../../../playwright/openYoutube";

const router = Router();

router.post("/open-youtube", async (req, res) => {
  try {
    console.log(
      "/api/playwright/open-youtube called from",
      req.ip || req.socket.remoteAddress
    );
    const waitForEnter = req.body?.waitForEnter === true;
    await openYouTube({ waitForEnter });
    res.json({ ok: true });
  } catch (err) {
    console.error("playwright error", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
