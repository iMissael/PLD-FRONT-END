import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UsuariosTable } from "@/features/configuraciones/administracion/usuarios/components/UsuariosTable";
import { renderWithProviders } from "@/test/test-utils";

describe("UsuariosTable", () => {
  it("lists usuarios returned by the API", async () => {
    renderWithProviders(<UsuariosTable onEditar={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("@admin")).toBeInTheDocument();
    });

    expect(screen.getByText("ROLE_ADMIN")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("muestra editar, desactivar y eliminar, y editar entrega el usuario", async () => {
    const onEditar = vi.fn();
    renderWithProviders(<UsuariosTable onEditar={onEditar} />);

    const editar = await screen.findByRole("button", { name: /Editar a/ });
    expect(screen.getByRole("button", { name: /Desactivar a/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Eliminar a/ })).toBeInTheDocument();

    await userEvent.click(editar);
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ username: "admin" }));
  });
});
