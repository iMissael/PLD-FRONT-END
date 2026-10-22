import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/atoms/Button";
import { Alert, Card } from "@/shared/components/molecules";
import { TablePagination } from "@/shared/components/molecules/TablePagination";
import { emptyState } from "@/shared/styles/tokens";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";

import { ItemNotificacion } from "../components/ItemNotificacion";
import {
  useMarcarLeida,
  useMarcarTodasLeidas,
  useNoLeidas,
  useNotificaciones,
} from "../hooks/useNotificaciones";
import type { Notificacion } from "../types/notificaciones";

export function NotificacionesPage() {
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(10);
  const navigate = useNavigate();
  const rutaEnTenant = useRutaTenant();
  const { data, isLoading, isError } = useNotificaciones(soloNoLeidas, pagina, tamanio);
  const { data: noLeidas = 0 } = useNoLeidas(true);
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();

  const abrir = (notificacion: Notificacion) => {
    if (!notificacion.leida) marcarLeida.mutate(notificacion.id);
    if (notificacion.enlace) navigate(rutaEnTenant(notificacion.enlace));
  };

  const filtro = (valor: boolean, etiqueta: string) => (
    <button
      type="button"
      onClick={() => {
        setSoloNoLeidas(valor);
        setPagina(0);
      }}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        soloNoLeidas === valor
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-foreground hover:bg-muted/50"
      }`}
    >
      {etiqueta}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-foreground text-xl font-semibold">Notificaciones</h2>
          <p className="text-muted-foreground text-sm">
            Avisos diarios de alertas por reportar, por dictaminar y del reporte
            trimestral.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={noLeidas === 0 || marcarTodas.isPending}
          onClick={() => marcarTodas.mutate()}
          className="rounded-full"
        >
          Marcar todas como leídas
        </Button>
      </div>

      <div className="flex gap-2">
        {filtro(false, "Todas")}
        {filtro(true, `Sin leer (${noLeidas})`)}
      </div>

      {isError ? <Alert>No se pudieron cargar las notificaciones.</Alert> : null}
      {isLoading ? (
        <div className={emptyState}>Cargando notificaciones…</div>
      ) : (data?.contenido ?? []).length === 0 ? (
        <div className={emptyState}>
          {soloNoLeidas
            ? "No tienes notificaciones sin leer."
            : "No tienes notificaciones."}
        </div>
      ) : (
        <Card className="gap-1 px-2 py-2">
          {(data?.contenido ?? []).map((n) => (
            <ItemNotificacion key={n.id} notificacion={n} onAbrir={abrir} />
          ))}
          <TablePagination
            count={data?.totalElementos ?? 0}
            page={pagina}
            rowsPerPage={tamanio}
            onPageChange={(_, nueva) => setPagina(nueva)}
            onRowsPerPageChange={(e) => {
              setTamanio(Number(e.target.value));
              setPagina(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>
      )}
    </div>
  );
}
