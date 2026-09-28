const TOKEN_KEY = "pld_auth_token";

let memoryToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  if (!memoryToken && typeof window !== "undefined") {
    memoryToken = localStorage.getItem(TOKEN_KEY);
  }
  return memoryToken;
}
