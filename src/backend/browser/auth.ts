import path from "path";
import fs from "fs";

export function storagePathFor(agentId: string) {
  const dir = path.resolve(process.cwd(), "playwright-user-data", "agents");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${agentId}-storage.json`);
}

export function readStorage(agentId: string) {
  const p = storagePathFor(agentId);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export function writeStorage(agentId: string, obj: any) {
  const p = storagePathFor(agentId);
  fs.writeFileSync(p, JSON.stringify(obj));
}
