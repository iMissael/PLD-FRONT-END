import { apiClient } from "@/api/client";
import type {
  AgregarObservacionInput,
  AlertaPLD,
  CambiarEstatusInput,
  CrearDenunciaInput,
  Denuncia,
  EditarDenunciaInput,
  EvidenciaDenuncia,
  ListarAlertasParams,
  ListarDenunciasParams,
  ObservacionDenuncia,
  PageResponse,
} from "../types/buzon";

/** Registrar denuncia anónima (JSON o Multipart según Swagger) */
export async function crearDenunciaAnonima(
  input: CrearDenunciaInput,
  evidencias?: File[],
  signal?: AbortSignal,
): Promise<Denuncia> {
  if (evidencias && evidencias.length > 0) {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(input)], { type: "application/json" });
    formData.append("denuncia", jsonBlob);
    evidencias.forEach((file) => formData.append("evidencias", file));

    const { data } = await apiClient.post<Denuncia>("/buzon/denuncias", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
    });
    return data;
  }

  const { data } = await apiClient.post<Denuncia>("/buzon/denuncias", input, { signal });
  return data;
}

/** Listar denuncias paginadas con filtros */
export async function listarDenuncias(
  params?: ListarDenunciasParams,
  signal?: AbortSignal,
): Promise<PageResponse<Denuncia>> {
  const { data } = await apiClient.get<PageResponse<Denuncia>>("/buzon/denuncias", {
    params,
    signal,
  });
  return data;
}

/** Obtener detalle de denuncia por ID */
export async function verDenunciaPorId(
  id: number,
  signal?: AbortSignal,
): Promise<Denuncia> {
  const { data } = await apiClient.get<Denuncia>(`/buzon/denuncias/${id}`, {
    signal,
  });
  return data;
}

/** Editar denuncia en estado REVISION (V) */
export async function editarDenuncia(
  id: number,
  input: EditarDenunciaInput,
  signal?: AbortSignal,
): Promise<Denuncia> {
  const { data } = await apiClient.put<Denuncia>(`/buzon/denuncias/${id}`, input, {
    signal,
  });
  return data;
}

/** Cambiar estatus de la denuncia (R->V, V->A, V->D) */
export async function cambiarEstatusDenuncia(
  id: number,
  input: CambiarEstatusInput,
  signal?: AbortSignal,
): Promise<Denuncia> {
  const { data } = await apiClient.patch<Denuncia>(
    `/buzon/denuncias/${id}/estatus`,
    input,
    {
      params: {
        nuevoEstatus: input.nuevoEstatus,
        estatus: input.nuevoEstatus,
      },
      signal,
    },
  );
  return data;
}

/** Listar evidencias asociadas */
export async function listarEvidencias(
  denunciaId: number,
  signal?: AbortSignal,
): Promise<EvidenciaDenuncia[]> {
  const { data } = await apiClient.get<EvidenciaDenuncia[]>(
    `/buzon/denuncias/${denunciaId}/evidencias`,
    { signal },
  );
  return data;
}

/** Adjuntar archivo de evidencia a denuncia */
export async function adjuntarEvidencia(
  denunciaId: number,
  archivo: File,
  signal?: AbortSignal,
): Promise<EvidenciaDenuncia> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const { data } = await apiClient.post<EvidenciaDenuncia>(
    `/buzon/denuncias/${denunciaId}/evidencias`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
    },
  );
  return data;
}

/** Listar observaciones de una denuncia */
export async function listarObservaciones(
  denunciaId: number,
  signal?: AbortSignal,
): Promise<ObservacionDenuncia[]> {
  const { data } = await apiClient.get<ObservacionDenuncia[]>(
    `/buzon/denuncias/${denunciaId}/observaciones`,
    { signal },
  );
  return data;
}

/** Agregar observación a denuncia en estado REVISION */
export async function agregarObservacion(
  denunciaId: number,
  input: AgregarObservacionInput,
  signal?: AbortSignal,
): Promise<ObservacionDenuncia> {
  const { data } = await apiClient.post<ObservacionDenuncia>(
    `/buzon/denuncias/${denunciaId}/observaciones`,
    { request: input },
    { signal },
  );
  return data;
}

/** Listar alertas PLD generadas */
export async function listarAlertas(
  params?: ListarAlertasParams,
  signal?: AbortSignal,
): Promise<PageResponse<AlertaPLD>> {
  const { data } = await apiClient.get<PageResponse<AlertaPLD>>("/buzon/alertas", {
    params,
    signal,
  });
  return data;
}

/** Obtener detalle de alerta por ID */
export async function verAlertaPorId(
  id: number,
  signal?: AbortSignal,
): Promise<AlertaPLD> {
  const { data } = await apiClient.get<AlertaPLD>(`/buzon/alertas/${id}`, {
    signal,
  });
  return data;
}
