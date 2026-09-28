import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsuariosTable } from "@/features/configuraciones/administracion/usuarios/components/UsuariosTable";
import { renderWithProviders } from "@/test/test-utils";

describe("UsuariosTable", () => {
  it("lists usuarios returned by the API", async () => {
    renderWithProviders(<UsuariosTable />);

    expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });
});
