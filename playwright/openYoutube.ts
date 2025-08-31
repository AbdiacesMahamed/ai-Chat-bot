import readline from "readline";
// manager is imported dynamically at runtime to avoid static resolution issues
// under different module resolution settings.
type ManagerLike = {
  acquirePage: (opts?: { show?: boolean }) => Promise<any>;
  saveAgentStorage?: (agentId: string) => Promise<void>;
};

type OpenOptions = { show?: boolean; waitForEnter?: boolean };

async function promptEnter(): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Press ENTER to close the browser...\n", () => {
      rl.close();
      resolve();
    });
  });
}

// Keep the signature compatible with callers; the function always launches
// a headed Chromium instance. If opts.waitForEnter is true, it waits for
// user input before closing the browser.
export async function openYouTube(opts: OpenOptions = {}) {
  const wait = !!opts.waitForEnter;
  const manager: ManagerLike = (await import(
    "../src/backend/browser/manager.js"
  )) as any;
  const page = await manager.acquirePage({ show: !!opts.show });
  await page.goto("https://www.youtube.com", { waitUntil: "domcontentloaded" });

  if (wait) {
    console.log("Browser opened in headed mode. Waiting for Enter to close.");
    await promptEnter();
    // optionally persist agent storage if agentId provided
    if ((opts as any).agentId && manager.saveAgentStorage) {
      await manager.saveAgentStorage((opts as any).agentId);
    }
  } else {
    console.log("Browser opened in headed mode.");
  }

  return { ok: true };
}

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2).map((a) => a.toLowerCase());
    const waitForEnter =
      args.includes("--wait-for-enter") || args.includes("--keep-open");
    try {
      await openYouTube({ waitForEnter });
    } catch (e) {
      console.error("openYouTube failed:", e);
      process.exit(1);
    }
  })();
}
