import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RolesTable } from "@/features/configuraciones/administracion/roles/components/RolesTable";
import { renderWithProviders } from "@/test/test-utils";

describe("RolesTable", () => {
  it("lists roles returned by the API", async () => {
    renderWithProviders(<RolesTable />);

    expect(screen.getByText(/cargando roles/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ROLE_ADMIN")).toBeInTheDocument();
    });

    expect(screen.getByText("ESTANDAR")).toBeInTheDocument();
  });
});
