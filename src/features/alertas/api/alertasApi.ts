import { apiClient } from "@/api/client";

import type {
  Alerta,
  BusquedaEmpleados,
  CrearAlertaManualInput,
  DictamenInput,
  EmpleadoExterno,
  EstatusAlertaRevision,
  ExpedienteAlerta,
  FiltroAlertas,
  MovimientoAlerta,
  PaginaAlertas,
  PaginaEmpleados,
  RazonAlerta,
  TipoAlerta,
} from "../types/alertas";

function tipoEstatusParam(tiposEstatus: Record<string, EstatusAlertaRevision[]>): string {
  return Object.entries(tiposEstatus)
    .flatMap(([tipo, estatus]) =>
      estatus.length === 0
        ? [tipo]
        : estatus
            .flatMap((e): EstatusAlertaRevision[] => (e === "CONFIRMADA" ? [e, "REPORTADA"] : [e]))
            .map((e) => `${tipo}:${e}`),
    )
    .join(",");
}

export async function listarTiposAlerta(): Promise<TipoAlerta[]> {
  const { data } = await apiClient.get<TipoAlerta[]>(`/tipos-alerta`);
  return data;
}

export async function listarRazonesAlerta(
  alertaAcronimo?: string,
): Promise<RazonAlerta[]> {
  const { data } = await apiClient.get<RazonAlerta[]>(`/razones-alerta`, {
    params: alertaAcronimo ? { alertaAcronimo } : undefined,
  });
  return data;
}

export async function listarAlertas(
  filtro: FiltroAlertas,
  pagina: number,
  tamanio: number,
): Promise<PaginaAlertas> {
  const { tiposEstatus, ...resto } = filtro;
  const params = {
    ...Object.fromEntries(
      Object.entries(resto).filter(([, valor]) => valor !== undefined && valor !== ""),
    ),
    ...(tiposEstatus && Object.keys(tiposEstatus).length > 0
      ? { tipoEstatus: tipoEstatusParam(tiposEstatus) }
      : {}),
    pagina,
    tamanio,
  };
  const { data } = await apiClient.get<PaginaAlertas>(`/alertas`, { params });
  return data;
}

export async function obtenerExpedienteAlerta(id: number): Promise<ExpedienteAlerta> {
  const { data } = await apiClient.get<ExpedienteAlerta>(
    `/alertas/${id}/expediente`,
  );
  return data;
}

export async function obtenerMovimientoAlerta(id: number): Promise<MovimientoAlerta> {
  const { data } = await apiClient.get<MovimientoAlerta>(`/alertas/${id}/movimiento`);
  return data;
}

export async function capturarAlertaManual(
  input: CrearAlertaManualInput,
): Promise<Alerta> {
  const { data } = await apiClient.post<Alerta>(`/alertas-manuales`, input);
  return data;
}

export async function dictaminarAlerta(
  id: number,
  input: DictamenInput,
): Promise<Alerta> {
  const { data } = await apiClient.patch<Alerta>(`/alertas/${id}/dictamen`, input);
  return data;
}

export async function cancelarAlerta(id: number): Promise<void> {
  await apiClient.patch(`/alertas/${id}/cancelacion`);
}

export async function buscarEmpleados(nombre: string): Promise<EmpleadoExterno[]> {
  const { data } = await apiClient.get<EmpleadoExterno[]>("/empleados/buscar", {
    params: nombre ? { nombre } : undefined,
  });
  return data;
}

export async function buscarEmpleadosPaginados({
  criterio,
  valor,
  pagina,
  tamanio,
}: BusquedaEmpleados): Promise<PaginaEmpleados> {
  const { data } = await apiClient.get<PaginaEmpleados>("/empleados/pagina", {
    params: { criterio, valor: valor.trim() || undefined, pagina, tamanio },
  });
  return data;
}
