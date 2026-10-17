export type SavedQuoteSession = {
  id: string;
  token: string;
  productName: string;
  status?: string;
  updatedAt: string;
};

const INDEX_KEY = "bpp-quote-sessions";
const LEGACY_TOKEN_PREFIX = "bpp-quote-token:";

function readIndex(): SavedQuoteSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return migrateLegacySessions();
    const parsed = JSON.parse(raw) as SavedQuoteSession[];
    return Array.isArray(parsed) ? parsed : migrateLegacySessions();
  } catch {
    return [];
  }
}

function writeIndex(sessions: SavedQuoteSession[]) {
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(sessions));
}

function migrateLegacySessions(): SavedQuoteSession[] {
  const migrated: SavedQuoteSession[] = [];
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (!key?.startsWith(LEGACY_TOKEN_PREFIX)) continue;
    const id = key.slice(LEGACY_TOKEN_PREFIX.length);
    const token = window.sessionStorage.getItem(key);
    if (!id || !token) continue;
    migrated.push({
      id,
      token,
      productName: "Quote",
      updatedAt: new Date().toISOString(),
    });
  }
  if (migrated.length) writeIndex(migrated);
  return migrated;
}

export function listQuoteSessions(): SavedQuoteSession[] {
  return readIndex().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function saveQuoteSession(session: SavedQuoteSession) {
  const sessions = readIndex().filter((item) => item.id !== session.id);
  sessions.unshift({
    ...session,
    updatedAt: session.updatedAt || new Date().toISOString(),
  });
  writeIndex(sessions.slice(0, 24));
  window.sessionStorage.setItem(`${LEGACY_TOKEN_PREFIX}${session.id}`, session.token);
}

export function touchQuoteSession(id: string, patch: Partial<Omit<SavedQuoteSession, "id" | "token">>) {
  const sessions = readIndex();
  const index = sessions.findIndex((item) => item.id === id);
  if (index === -1) return;
  sessions[index] = {
    ...sessions[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeIndex(sessions);
}

export function getMostRecentQuoteSession() {
  return listQuoteSessions()[0] ?? null;
}
