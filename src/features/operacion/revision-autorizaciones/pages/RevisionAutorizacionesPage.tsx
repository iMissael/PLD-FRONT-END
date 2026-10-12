import { useState } from "react";

import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { listarTodasAutorizaciones } from "../api/autorizacionesApi";
import { AutorizacionesTable } from "../components/AutorizacionesTable";
import { DetalleAutorizacion } from "../components/DetalleAutorizacion";
import { FiltrosAutorizaciones } from "../components/FiltrosAutorizaciones";
import { useListaAutorizaciones } from "../hooks/useAutorizaciones";
import type { FiltroAutorizaciones, RevisionAutorizacion } from "../types/autorizaciones";
import { autorizacionesCsv, descargarCsv } from "../utils/formatoAutorizacion";

export function RevisionAutorizacionesPage() {
  const [filtro, setFiltro] = useState<FiltroAutorizaciones | null>(null);
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(20);
  const [seleccionada, setSeleccionada] = useState<RevisionAutorizacion | null>(null);
  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);
  const { data, isLoading } = useListaAutorizaciones(filtro, pagina, tamanio);
  const totalElementos = data?.totalElementos ?? 0;

  const exportar = async () => {
    if (!filtro) return;
    setExportando(true);
    setErrorExportar(null);
    try {
      const todas = await listarTodasAutorizaciones(filtro);
      descargarCsv(
        `alertas-autorizacion-${filtro.desde ?? "inicio"}-${filtro.hasta ?? "hoy"}.csv`,
        autorizacionesCsv(todas),
      );
    } catch {
      setErrorExportar("No se pudo exportar. Intenta de nuevo.");
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Revisión de alertas de autorización
        </h2>
        <p className="text-muted-foreground text-sm">
          Movimientos de caja que pidieron autorización y lo que se decidió en caja.
        </p>
      </div>

      <FiltrosAutorizaciones
        onConsultar={(nuevo) => {
          setFiltro(nuevo);
          setPagina(0);
          setSeleccionada(null);
        }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={totalElementos === 0 || exportando}
            onClick={() => void exportar()}
          >
            {exportando ? "Exportando..." : "Exportar a Excel"}
          </Button>
        </div>
        {errorExportar ? <Alert>{errorExportar}</Alert> : null}
        <AutorizacionesTable
          autorizaciones={data?.contenido}
          consultado={filtro !== null}
          isLoading={isLoading}
          seleccionadaId={seleccionada?.id ?? null}
          onSeleccionar={setSeleccionada}
          pagina={pagina}
          tamanio={tamanio}
          totalElementos={totalElementos}
          onCambiarPagina={setPagina}
          onCambiarTamanio={(nuevo) => {
            setTamanio(nuevo);
            setPagina(0);
          }}
        />
      </div>

      <DetalleAutorizacion seleccionada={seleccionada} />
    </div>
  );
}
