import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { PersonalizarCabeceraDenuncia } from "./PersonalizarCabeceraDenuncia";
import * as mensajeHooks from "@/features/buzon/hooks/useMensajeDenuncia";

vi.mock("@/features/buzon/hooks/useMensajeDenuncia", () => ({
  useMensajeDenunciaAdmin: vi.fn(),
  useNombreTenantPublico: vi.fn(),
  useActualizarMensajeDenunciaAdmin: vi.fn(),
  useMensajeDenunciaPublico: vi.fn(),
}));

vi.mock("@/shared/tenant/tenantStore", () => ({
  getCurrentTenantId: vi.fn(() => "SOFOM001"),
}));

describe("PersonalizarCabeceraDenuncia", () => {
  let queryClient: QueryClient;
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();

    vi.mocked(mensajeHooks.useNombreTenantPublico).mockReturnValue({
      data: {
        nombreComercial: "Mi SOFOM S.A. de C.V.",
      },
      isLoading: false,
    } as any);

    vi.mocked(mensajeHooks.useMensajeDenunciaAdmin).mockReturnValue({
      data: {
        sofomId: "SOFOM001",
        html: "<p>Mensaje inicial de prueba</p>",
        contenidoHtml: "<p>Mensaje inicial de prueba</p>",
        contenidoSanitizado: "<p>Mensaje inicial de prueba</p>",
        actualizadoPor: "admin@empresa.com",
        actualizadoEn: "2026-10-02T12:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(mensajeHooks.useActualizarMensajeDenunciaAdmin).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as any);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PersonalizarCabeceraDenuncia />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it("renderiza el editor con el contenido inicial y los metadatos del tenant", () => {
    renderComponent();

    expect(
      screen.getByText("Personalizar cabecera de denuncia anónima"),
    ).toBeInTheDocument();
    expect(screen.getByText("Mi SOFOM S.A. de C.V.")).toBeInTheDocument();
    expect(screen.getByText(/admin@empresa.com/)).toBeInTheDocument();

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("<p>Mensaje inicial de prueba</p>");
  });

  it("permite editar el HTML y muestra la previsualización en vivo", async () => {
    renderComponent();

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: "<h3>Nuevo Título Seguro</h3><p>Instrucciones</p>" },
    });

    expect(textarea.value).toBe(
      "<h3>Nuevo Título Seguro</h3><p>Instrucciones</p>",
    );
    expect(screen.getByText("Nuevo Título Seguro")).toBeInTheDocument();
    expect(screen.getByText("Instrucciones")).toBeInTheDocument();
  });

  it("envía la petición PUT al pulsar Guardar cambios", async () => {
    mutateAsyncMock.mockResolvedValueOnce({
      sofomId: "SOFOM001",
      html: "<p>Texto guardado</p>",
    });

    renderComponent();

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: "<p>Texto guardado</p>" },
    });

    const botonGuardar = screen.getByRole("button", {
      name: /Guardar cambios/i,
    });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        input: { html: "<p>Texto guardado</p>" },
      });
    });
  });

});
