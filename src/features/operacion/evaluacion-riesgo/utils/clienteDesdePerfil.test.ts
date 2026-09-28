import { describe, expect, it } from "vitest";
import { clienteDesdePerfil } from "@/features/operacion/evaluacion-riesgo/utils/clienteDesdePerfil";

describe("clienteDesdePerfil", () => {
  it("arma el expediente de una persona con el número sin el prefijo", () => {
    const cliente = clienteDesdePerfil({
      referencia: "PERS-8",
      nombre: "Alejandro Ramirez Torres",
      rfc: "RATA850312AB1",
      curp: "RATA850312HDFMRL05",
      tipoPersona: { id: "1", nombre: "Persona Física Nacional" },
    });
    expect(cliente).toMatchObject({
      numero: "8",
      referencia: "PERS-8",
      rfc: "RATA850312AB1",
      persona: "FISICA",
      tipoCliente: "Persona Física Nacional",
      sucursal: "—",
    });
  });

  it("marca persona moral y usa guiones para lo que no hay", () => {
    const cliente = clienteDesdePerfil({
      referencia: "CLI-CORP-001",
      nombre: "Socio Alpha",
      tipoPersona: { id: "2", nombre: "Persona Moral Nacional" },
    });
    expect(cliente.persona).toBe("MORAL");
    expect(cliente.numero).toBe("CLI-CORP-001");
    expect(cliente.rfc).toBe("—");
    expect(cliente.curp).toBe("—");
  });
});
