import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label, table } from "@/shared/components/ui/styles";

import { useEmitirCredencial, useRevocarCredencial } from "../hooks/useIntegraciones";
import {
  MAX_CREDENCIALES_VIGENTES,
  type CredencialEmitidaResponse,
  type CredencialResponse,
  type SistemaIntegracionResponse,
} from "../types/integraciones";
import { fechaHora } from "./formato";
import { SecretoEmitido } from "./SecretoEmitido";

interface CredencialesPanelProps {
  sistema: SistemaIntegracionResponse;
  onError: (error: unknown) => void;
}

function estadoCredencial(c: CredencialResponse): { texto: string; tono: "activo" | "inactivo" | "neutro" } {
  if (c.revocadaEn) return { texto: "Revocada", tono: "inactivo" };
  if (!c.vigente) return { texto: "Expirada", tono: "neutro" };
  return { texto: "Vigente", tono: "activo" };
}

/** Credenciales del sistema: emitir (el secreto se ve una sola vez) y revocar. */
export function CredencialesPanel({ sistema, onError }: CredencialesPanelProps) {
  const emitir = useEmitirCredencial();
  const revocar = useRevocarCredencial();
  const [etiqueta, setEtiqueta] = useState("");
  const [vigenciaDias, setVigenciaDias] = useState(365);
  const [emitida, setEmitida] = useState<CredencialEmitidaResponse | null>(null);

  const vigentes = sistema.credenciales.filter((c) => c.vigente).length;
  const limiteAlcanzado = vigentes >= MAX_CREDENCIALES_VIGENTES;
  const vigenciaValida = Number.isInteger(vigenciaDias) && vigenciaDias >= 1 && vigenciaDias <= 730;

  const handleEmitir = (event: React.FormEvent) => {
    event.preventDefault();
    if (!vigenciaValida || limiteAlcanzado) return;
    emitir.mutate(
      { id: sistema.id, input: { etiqueta: etiqueta.trim() || undefined, vigenciaDias } },
      {
        onSuccess: (respuesta) => {
          setEmitida(respuesta);
          setEtiqueta("");
        },
        onError,
      },
    );
  };

  // Las revocadas y expiradas van al final.
  const credenciales = [...sistema.credenciales].sort((a, b) => Number(b.vigente) - Number(a.vigente));

  return (
    <section className={`flex flex-col gap-4 p-4 ${card}`}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Credenciales de {sistema.clientId}</h3>
        <p className={hint}>
          Máximo {MAX_CREDENCIALES_VIGENTES} vigentes a la vez, para rotar sin cortar el servicio: emite la nueva,
          que el sistema la cambie y luego revoca la anterior.
        </p>
      </div>

      {emitida ? <SecretoEmitido emitida={emitida} onCerrar={() => setEmitida(null)} /> : null}

      {credenciales.length === 0 ? (
        <p className="text-sm text-muted-foreground">El sistema todavía no tiene credenciales.</p>
      ) : (
        <div className={`overflow-x-auto ${table.wrapper}`}>
          <table className={table.root}>
            <thead className={table.head}>
              <tr>
                <th className={table.headCell}>Etiqueta</th>
                <th className={table.headCell}>Estado</th>
                <th className={table.headCell}>Emitida</th>
                <th className={table.headCell}>Expira</th>
                <th className={table.headCell}>Último uso</th>
                <th className={table.headCell} aria-label="Acciones" />
              </tr>
            </thead>
            <tbody className={table.body}>
              {credenciales.map((c) => {
                const estado = estadoCredencial(c);
                return (
                  <tr key={c.id}>
                    <td className={table.cell}>{c.etiqueta || "—"}</td>
                    <td className={table.cell}>
                      <Badge tono={estado.tono}>{estado.texto}</Badge>
                    </td>
                    <td className={table.cellMuted}>{fechaHora(c.creadaEn)}</td>
                    <td className={table.cellMuted}>{fechaHora(c.revocadaEn ?? c.expiraEn)}</td>
                    <td className={table.cellMuted}>{fechaHora(c.ultimoUsoEn)}</td>
                    <td className={table.cell}>
                      {c.vigente ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type="button" variante="peligro" className="px-3 py-1 text-xs">
                              Revocar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Revocar la credencial {c.etiqueta || `#${c.id}`}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deja de servir para pedir tokens de inmediato. Los tokens ya emitidos con ella
                                siguen valiendo hasta que expiran (15 minutos). No se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive-hover"
                                disabled={revocar.isPending}
                                onClick={() => revocar.mutate({ id: sistema.id, credencialId: c.id }, { onError })}
                              >
                                Revocar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleEmitir} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="etiquetaCredencial" className={label}>
            Etiqueta (opcional)
          </label>
          <input
            id="etiquetaCredencial"
            type="text"
            maxLength={60}
            placeholder="produccion-2026"
            value={etiqueta}
            onChange={(event) => setEtiqueta(event.target.value)}
            className={field}
          />
        </div>
        <div className="flex flex-col gap-1 sm:w-40">
          <label htmlFor="vigenciaCredencial" className={label}>
            Vigencia (días)
          </label>
          <input
            id="vigenciaCredencial"
            type="number"
            min={1}
            max={730}
            value={vigenciaDias}
            onChange={(event) => setVigenciaDias(Number(event.target.value))}
            className={field}
            aria-invalid={!vigenciaValida}
          />
        </div>
        <Button
          type="submit"
          disabled={emitir.isPending || !vigenciaValida || limiteAlcanzado || sistema.estatus !== "A"}
        >
          {emitir.isPending ? "Emitiendo..." : "Emitir credencial"}
        </Button>
      </form>
      {limiteAlcanzado ? (
        <p className={hint}>Ya tiene {MAX_CREDENCIALES_VIGENTES} credenciales vigentes: revoca una para emitir otra.</p>
      ) : null}
      {sistema.estatus !== "A" ? <p className={hint}>El sistema está de baja: actívalo para emitir credenciales.</p> : null}
    </section>
  );
}
