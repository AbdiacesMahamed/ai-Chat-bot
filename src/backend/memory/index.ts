// Simple in-memory memory module with per-agent partitioning.
// Keys are stored as `${agent}:${sessionId}`. Replace or extend with Redis/file-backed storage later.
const memoryStore = new Map<string, string[]>();

function keyFor(agent: string, sessionId: string) {
  return `${agent}:${sessionId}`;
}

// Backwards-compatible functions (default agent: "default")
export function readMemory(sessionId: string, agent = "default") {
  return memoryStore.get(keyFor(agent, sessionId)) ?? [];
}

export function addMemory(sessionId: string, item: string, agent = "default") {
  const k = keyFor(agent, sessionId);
  const arr = memoryStore.get(k) ?? [];
  arr.push(item);
  memoryStore.set(k, arr);
}

export function clearMemory(sessionId: string, agent = "default") {
  memoryStore.delete(keyFor(agent, sessionId));
}

export function listSessions(agent = "default") {
  const prefix = `${agent}:`;
  return Array.from(memoryStore.keys())
    .filter((k) => k.startsWith(prefix))
    .map((k) => k.slice(prefix.length));
}

// Per-agent helper: returns functions bound to a specific agent name.
export function forAgent(agentName: string) {
  return {
    read: (sessionId: string) => readMemory(sessionId, agentName),
    add: (sessionId: string, item: string) =>
      addMemory(sessionId, item, agentName),
    clear: (sessionId: string) => clearMemory(sessionId, agentName),
    listSessions: () => listSessions(agentName),
  };
}
