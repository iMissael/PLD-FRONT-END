import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsuariosTable } from "@/features/configuraciones/administracion/usuarios/components/UsuariosTable";
import { renderWithProviders } from "@/test/test-utils";

describe("UsuariosTable", () => {
  it("lists usuarios returned by the API", async () => {
    renderWithProviders(<UsuariosTable />);

    await waitFor(() => {
      expect(screen.getByText("Administrador")).toBeInTheDocument();
    });

    expect(screen.getByText("@admin")).toBeInTheDocument();
    expect(screen.getByText("ROLE_ADMIN")).toBeInTheDocument();
  });
});
