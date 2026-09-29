const TOKEN_KEY = "pld_auth_token";

let memoryToken: string | null =
  typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;

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
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    const tokenFromStorage = sanitizeToken(sessionStorage.getItem(TOKEN_KEY));
    if (tokenFromStorage) {
      memoryToken = tokenFromStorage;
      return tokenFromStorage;
    }
  }
  return sanitizeToken(memoryToken);
}
