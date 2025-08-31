import path from "path";
import fs from "fs";
import { chromium, BrowserContext, Page } from "playwright";
import { getEnvMaxPages, getEnvHeadless } from "./config";
import { storagePathFor, writeStorage } from "./auth";

let context: BrowserContext | null = null;
let pages: Page[] = [];
let maxPages = getEnvMaxPages();
let headless = getEnvHeadless();

export function setMaxPages(n: number) {
  maxPages = Math.max(1, n);
}

export function getMaxPages() {
  return maxPages;
}

async function ensureContext(show = false) {
  // If we already have a context, validate it's still usable. If Playwright
  // has closed it externally or it's in a bad state, reset and relaunch.
  if (context) {
    try {
      // storageState will reject if the context is closed/invalid.
      // This is a cheap way to validate the context without creating pages.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      await context.storageState();
      return; // existing context is valid
    } catch (err) {
      // Reset broken context and pages and fall through to relaunch
      try {
        await context.close();
      } catch (e) {
        /* ignore */
      }
      context = null;
      pages = [];
    }
  }
  const userDataDir = path.resolve(process.cwd(), "playwright-user-data");
  if (!fs.existsSync(userDataDir))
    fs.mkdirSync(userDataDir, { recursive: true });
  context = await chromium.launchPersistentContext(userDataDir, {
    headless: !show,
    devtools: show,
  });
}

export async function acquirePage(
  options: { show?: boolean } = {}
): Promise<Page> {
  // determine whether to show based on explicit option, runtime setter, or env
  const show = options.show === true ? true : options.show === false ? false : !headless;
  await ensureContext(!!show);

  // Filter out closed pages from our cache
  pages = pages.filter((p) => !p.isClosed());

  // create first page if none
  if (pages.length === 0) {
    const p = await context!.newPage();
    pages.push(p);
    return p;
  }

  // if under maxPages, create another
  if (pages.length < maxPages) {
    const p = await context!.newPage();
    pages.push(p);
    return p;
  }

  // otherwise reuse the first page (single-page default)
  return pages[0];
}




export function headlessFlag(value?: boolean): boolean {
  if (typeof value === "boolean") {
    headless = value;
  }
  return headless;
}

// Check whether a Playwright browser context is currently open and usable.
export async function isBrowserOpen(): Promise<boolean> {
  if (!context) return false;
  try {
    await context.storageState();
    return true;
  } catch {
    return false;
  }
}

export async function closeAll() {
  try {
    for (const p of pages) {
      try {
        await p.close();
      } catch (e) {
        /* ignore */
      }
    }
    pages = [];
    if (context) {
      await context.close();
      context = null;
    }
  } catch (e) {
    /* ignore */
  }
}

export async function saveAgentStorage(agentId: string) {
  if (!context) return;
  try {
    const state = await context.storageState();
    writeStorage(agentId, state);
  } catch (e) {
    console.warn("Failed to save agent storage:", e);
  }
}
