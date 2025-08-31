import path from "path";
import fs from "fs";
import { chromium, BrowserContext, Page } from "playwright";
import { getEnvMaxPages } from "./config";
import { storagePathFor, writeStorage } from "./auth";

let context: BrowserContext | null = null;
let pages: Page[] = [];
let maxPages = getEnvMaxPages();

export function setMaxPages(n: number) {
  maxPages = Math.max(1, n);
}

export function getMaxPages() {
  return maxPages;
}

async function ensureContext(show = false) {
  if (context) return;
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
  await ensureContext(!!options.show);
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
