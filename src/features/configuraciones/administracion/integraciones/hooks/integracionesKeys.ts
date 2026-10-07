export const integracionesKeys = {
  all: ["integraciones"] as const,
  sistemas: () => [...integracionesKeys.all, "sistemas"] as const,
  scopes: () => [...integracionesKeys.all, "scopes"] as const,
};
