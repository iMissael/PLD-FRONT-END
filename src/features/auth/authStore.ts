const TOKEN_KEY = "pld_auth_token";

let memoryToken: string | null =
  typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    const tokenFromStorage = sessionStorage.getItem(TOKEN_KEY);
    if (tokenFromStorage) {
      memoryToken = tokenFromStorage;
      return tokenFromStorage;
    }
  }
  return memoryToken;
}
