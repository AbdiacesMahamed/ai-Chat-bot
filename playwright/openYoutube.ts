import readline from "readline";
import * as managerModule from "../src/backend/browser/manager";

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

function watchPageClosed(page: any, timeoutMs = 10000): Promise<'closed' | 'timeout'> {
  return new Promise((resolve) => {
    let done = false;
    const interval = 100;
    const start = Date.now();

    const timer = setInterval(() => {
      try {
        if (page.isClosed && page.isClosed()) {
          done = true;
          clearInterval(timer);
          resolve('closed');
        }
      } catch (e) {
        // if isClosed throws, treat as closed
        done = true;
        clearInterval(timer);
        resolve('closed');
      }
      if (!done && Date.now() - start > timeoutMs) {
        done = true;
        clearInterval(timer);
        resolve('timeout');
      }
    }, interval);
  });
}

// Keep the signature compatible with callers; the function opens a browser
// page and defers headed/headless mode to the browser manager unless
// `opts.show` is provided. If opts.waitForEnter is true, it waits for
// user input before closing the browser.
export async function openYouTube(opts: OpenOptions = {}) {
  const wait = !!opts.waitForEnter;
  const manager: ManagerLike = (managerModule as any) as ManagerLike;
  console.log('acquiring Playwright page (show=%s)...', opts.show);
  const page = await manager.acquirePage({ show: opts.show });
    console.log('page acquired, navigating to YouTube...');
    await page.goto("https://www.youtube.com", { waitUntil: "domcontentloaded" });
    console.log('navigation complete, page.url=', page.url?.());

  if (wait) {
    console.log("Browser opened. Waiting for Enter to close or browser window to be closed.");
    // race between user pressing Enter and the page being closed manually
    const enterPromise = promptEnter();
    const closedPromise = watchPageClosed(page, 0xffffffff);
    const winner = await Promise.race([enterPromise.then(() => 'enter'), closedPromise]);
    if (winner === 'closed') {
      console.log('Detected browser window closed by user.');
    }
    // optionally persist agent storage if agentId provided
    if ((opts as any).agentId && manager.saveAgentStorage) {
      await manager.saveAgentStorage((opts as any).agentId);
    }
  } else {
      console.log("Browser opened. Will stay open for up to 10s for visibility or until closed by user.");
      // Poll for page close and return early when closed, otherwise wait up to 10s
      const result = await watchPageClosed(page, 10000);
      if (result === 'closed') {
        console.log('Detected browser window closed by user during visibility timeout.');
      }
  }

  return { ok: true };
}

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2).map((a) => a.toLowerCase());
    // default CLI behavior: wait for Enter unless --no-wait passed
    const noWait = args.includes("--no-wait") || args.includes("--nowait");
    const waitForEnter = !noWait;
    try {
      await openYouTube({ waitForEnter });
    } catch (e) {
      console.error("openYouTube failed:", e);
      process.exit(1);
    }
  })();
}
