import type { InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { afterEach, describe, expect, it } from "vitest";

import { resetCurrentTenantId, setCurrentTenantId } from "@/shared/tenant/tenantStore";

import { tenantInterceptor } from "./tenantInterceptor";

function config(url: string): InternalAxiosRequestConfig {
  return { url, headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
}

describe("tenantInterceptor", () => {
  afterEach(() => resetCurrentTenantId());

  it("antepone el tenant a la ruta y manda el header X-Tenant-Id", () => {
    setCurrentTenantId("abc-123");

    const resultado = tenantInterceptor(config("/personas-bloqueadas"));

    expect(resultado.url).toBe("/SICANETSC/PLD/abc-123/personas-bloqueadas");
    expect(resultado.headers.get("X-Tenant-Id")).toBe("abc-123");
  });

  it("falla ruidosamente si no hay tenant activo", () => {
    expect(() => tenantInterceptor(config("/usuarios"))).toThrow(/tenant activo/i);
  });
});
