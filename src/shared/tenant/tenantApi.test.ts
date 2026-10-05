import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/client";
import { fetchTenantNombre } from "@/shared/tenant/tenantApi";

describe("fetchTenantNombre", () => {
  afterEach(() => vi.restoreAllMocks());

  it("pide el nombre público por header, sin prefijo de tenant en la URL", async () => {
    const get = vi
      .spyOn(apiClient, "get")
      .mockResolvedValue({ data: { nombreComercial: "Empresa Corporativa" } });

    await expect(fetchTenantNombre("tenant-123")).resolves.toBe("Empresa Corporativa");
    expect(get).toHaveBeenCalledWith("/publico/nombre", {
      skipTenantInterceptor: true,
      headers: { "X-Tenant-Id": "tenant-123" },
    });
  });
});
