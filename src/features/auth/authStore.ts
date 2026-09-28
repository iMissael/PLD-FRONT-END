const TOKEN_KEY = "pld_auth_token";

let memoryToken: string | null = null;

function sanitizeToken(token: string | null): string | null {
  if (!token) return null;
  let clean = token.trim();
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  return clean;
}

export function setAuthToken(token: string | null): void {
  const clean = sanitizeToken(token);
  memoryToken = clean;
  if (typeof window !== "undefined") {
    if (clean) {
      sessionStorage.setItem(TOKEN_KEY, clean);
      localStorage.setItem(TOKEN_KEY, clean);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}

export function getAuthToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }
  if (typeof window !== "undefined") {
    const sessionTok = sanitizeToken(sessionStorage.getItem(TOKEN_KEY));
    if (sessionTok) {
      memoryToken = sessionTok;
      return sessionTok;
    }
    const localTok = sanitizeToken(localStorage.getItem(TOKEN_KEY));
    if (localTok) {
      memoryToken = localTok;
      sessionStorage.setItem(TOKEN_KEY, localTok);
      return localTok;
    }
  }
  return null;
}
