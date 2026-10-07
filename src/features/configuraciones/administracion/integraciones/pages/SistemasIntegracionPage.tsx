import { useEffect, useRef, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";

import { CredencialesPanel } from "../components/CredencialesPanel";
import { SistemaForm } from "../components/SistemaForm";
import { SistemasTable } from "../components/SistemasTable";
import {
  useActualizarSistema,
  useCambiarEstatusSistema,
  useRegistrarSistema,
  useSistemasIntegracion,
} from "../hooks/useIntegraciones";
import type { RegistrarSistemaInput } from "../types/integraciones";

/**
 * Sistemas satélite que usan la API de integración: alta, scopes, baja y credenciales.
 * Reemplaza la carpeta "Administración" de la colección Postman para el día a día.
 */
export function SistemasIntegracionPage() {
  const { data: sistemas, isLoading } = useSistemasIntegracion();
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const registrar = useRegistrarSistema();
  const actualizar = useActualizarSistema();
  const cambiarEstatus = useCambiarEstatusSistema();

  // Se toma de la lista para que credenciales y estatus se refresquen tras cada cambio.
  const seleccionado = sistemas?.find((s) => s.id === seleccionadoId) ?? null;

  useEffect(() => {
    if (creandoNuevo || seleccionadoId != null) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [creandoNuevo, seleccionadoId]);

  const onError = (error: unknown) =>
    setMensajeError(isAppError(error) ? error.message : "Ocurrió un error inesperado.");

  const handleGuardar = (input: RegistrarSistemaInput) => {
    setMensajeError(null);
    if (creandoNuevo) {
      registrar.mutate(input, {
        onSuccess: (sistema) => {
          setCreandoNuevo(false);
          setSeleccionadoId(sistema.id);
        },
        onError,
      });
    } else if (seleccionado) {
      actualizar.mutate({ id: seleccionado.id, input: { nombre: input.nombre, scopes: input.scopes } }, { onError });
    }
  };

  const cerrar = () => {
    setCreandoNuevo(false);
    setSeleccionadoId(null);
    setMensajeError(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Sistemas de integración</h2>
          <p className="text-sm text-muted-foreground">
            Sistemas satélite (Socios, Ventas, Cobranza...) que consumen la API de la Matriz con credenciales
            propias. Cada empresa registra los suyos.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreandoNuevo(true);
            setSeleccionadoId(null);
            setMensajeError(null);
          }}
        >
          Nuevo sistema
        </Button>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <SistemasTable
        sistemas={sistemas}
        isLoading={isLoading}
        seleccionadoId={seleccionadoId}
        onSeleccionar={(sistema) => {
          setSeleccionadoId(sistema.id);
          setCreandoNuevo(false);
          setMensajeError(null);
        }}
      />

      {creandoNuevo || seleccionado ? (
        <div ref={formRef} className="flex flex-col gap-4 scroll-mt-4">
          <SistemaForm
            sistema={creandoNuevo ? null : seleccionado}
            onGuardar={handleGuardar}
            onCancelar={cerrar}
            isPending={registrar.isPending || actualizar.isPending}
          />

          {seleccionado && !creandoNuevo ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variante={seleccionado.estatus === "A" ? "peligro" : "primario"}
                  disabled={cambiarEstatus.isPending}
                  onClick={() => {
                    setMensajeError(null);
                    cambiarEstatus.mutate(
                      { id: seleccionado.id, estatus: seleccionado.estatus === "A" ? "B" : "A" },
                      { onError },
                    );
                  }}
                >
                  {seleccionado.estatus === "A" ? "Dar de baja" : "Reactivar"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {seleccionado.estatus === "A"
                    ? "De baja no puede pedir tokens nuevos; los emitidos expiran en 15 minutos."
                    : "Al reactivarlo vuelven a servir sus credenciales vigentes."}
                </span>
              </div>
              <CredencialesPanel sistema={seleccionado} onError={onError} />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
