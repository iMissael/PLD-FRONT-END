import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import type {
  EstatusAlertaRevision,
  FiltroAlertas,
  OrigenAlerta,
  TipoAlerta,
} from "@/features/alertas/types/alertas";
import { CalendarioFecha } from "@/shared/components/molecules/CalendarioFecha";
import { CasillaRedonda } from "@/shared/components/atoms/CasillaRedonda";
import { Button } from "@/shared/components/atoms/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/molecules/Popover";
import { field, hint, label } from "@/shared/styles/tokens";

import { formatearFecha } from "../utils/formato";

/** Confirmadas incluye las reportadas (en la revisión se ven igual, ver estatusDe). */
const ESTATUS: { valor: EstatusAlertaRevision; etiqueta: string }[] = [
  { valor: "PENDIENTE", etiqueta: "Pendientes" },
  { valor: "CONFIRMADA", etiqueta: "Confirmadas" },
  { valor: "RECHAZADA", etiqueta: "Rechazadas" },
];
const TODOS_LOS_ESTATUS = ESTATUS.map((e) => e.valor);

/** Tipo -> estatus marcados. Un tipo marcado completo los tiene todos. */
type Seleccion = Record<string, EstatusAlertaRevision[]>;

interface FiltrosAlertasProps {
  inicial: FiltroAlertas;
  onAplicar: (filtro: FiltroAlertas) => void;
}

/**
 * Fuera del filtro: Autorización y Seguimiento tienen su propia revisión, Alerta de
 * sistema no se usa y los tipos inactivos no generan alertas nuevas.
 */
const TIPOS_FUERA_DEL_FILTRO = ["A", "S", "T"];

function tiposFiltrables(tipos: TipoAlerta[] | undefined): TipoAlerta[] {
  return (tipos ?? []).filter(
    (t) => !TIPOS_FUERA_DEL_FILTRO.includes(t.alertaAcronimo) && t.estado === "ACTIVO",
  );
}

/** En el filtro, una lista vacía es "todos los estatus"; en pantalla se ven todos marcados. */
function seleccionDe(filtro: FiltroAlertas): Seleccion {
  return Object.fromEntries(
    Object.entries(filtro.tiposEstatus ?? {}).map(([tipo, estatus]) => [
      tipo,
      estatus.length === 0 ? TODOS_LOS_ESTATUS : estatus,
    ]),
  );
}

function tiposEstatusDe(seleccion: Seleccion): FiltroAlertas["tiposEstatus"] {
  const entradas = Object.entries(seleccion)
    .filter(([, estatus]) => estatus.length > 0)
    .map(([tipo, estatus]): [string, EstatusAlertaRevision[]] => [
      tipo,
      estatus.length === TODOS_LOS_ESTATUS.length ? [] : estatus,
    ]);
  return entradas.length > 0 ? Object.fromEntries(entradas) : undefined;
}

const ETIQUETA_ORIGEN: Record<OrigenAlerta, string> = {
  AUTOMATICA: "Automáticas (cajas)",
  MANUAL: "Manuales",
};

function nombreTipo(tipos: TipoAlerta[], acronimo: string): string {
  const descripcion =
    tipos.find((t) => t.alertaAcronimo === acronimo)?.descripcion ?? acronimo;
  const minusculas = descripcion.toLocaleLowerCase("es-MX");
  return minusculas.charAt(0).toLocaleUpperCase("es-MX") + minusculas.slice(1);
}

/** Lo aplicado, en una línea: "Del 01/09/2026 al 13/10/2026 · Inusual (pendientes) · Manuales". */
function resumenDe(filtro: FiltroAlertas, tipos: TipoAlerta[]): string[] {
  const partes: string[] = [];
  if (filtro.desde && filtro.hasta) {
    partes.push(`Del ${formatearFecha(filtro.desde)} al ${formatearFecha(filtro.hasta)}`);
  } else if (filtro.desde) {
    partes.push(`Desde ${formatearFecha(filtro.desde)}`);
  } else if (filtro.hasta) {
    partes.push(`Hasta ${formatearFecha(filtro.hasta)}`);
  }
  Object.entries(filtro.tiposEstatus ?? {}).forEach(([tipo, estatus]) => {
    const detalle = estatus
      .map((e) => ESTATUS.find((x) => x.valor === e)?.etiqueta.toLocaleLowerCase("es-MX"))
      .join(", ");
    partes.push(
      detalle ? `${nombreTipo(tipos, tipo)} (${detalle})` : nombreTipo(tipos, tipo),
    );
  });
  if (filtro.origen) partes.push(ETIQUETA_ORIGEN[filtro.origen]);
  if (filtro.persona) partes.push(`"${filtro.persona}"`);
  return partes;
}

/** Cuántos grupos de filtro hay aplicados (fechas, tipo/estatus, origen, persona). */
function filtrosActivos(filtro: FiltroAlertas): number {
  return [
    filtro.desde || filtro.hasta,
    Object.keys(filtro.tiposEstatus ?? {}).length > 0,
    filtro.origen,
    filtro.persona,
  ].filter(Boolean).length;
}

/**
 * Filtros de "Revisión de alertas", al estilo de Sicanet: rango de fechas y una
 * matriz de tipo de alerta × estatus. Viven en un recuadro que se despliega desde el
 * botón "Filtros" para no ocupar la pantalla; se aplican al presionar el botón.
 */
export function FiltrosAlertas({ inicial, onAplicar }: FiltrosAlertasProps) {
  const { data } = useTiposAlerta();
  const tipos = tiposFiltrables(data);
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState<FiltroAlertas>(inicial);
  const [seleccion, setSeleccion] = useState<Seleccion>(() => seleccionDe(inicial));

  // Al abrir se parte de lo aplicado: si se cierra sin aplicar, los cambios se descartan.
  const abrir = (siguiente: boolean) => {
    if (siguiente) {
      setFiltro(inicial);
      setSeleccion(seleccionDe(inicial));
    }
    setAbierto(siguiente);
  };

  const activos = filtrosActivos(inicial);
  const resumen = resumenDe(inicial, tipos);

  const cambiar = <K extends keyof FiltroAlertas>(
    clave: K,
    valor: FiltroAlertas[K] | "",
  ) => setFiltro((prev) => ({ ...prev, [clave]: valor === "" ? undefined : valor }));

  const marcados = (tipo: string) => seleccion[tipo] ?? [];
  const tipoCompleto = (tipo: string) =>
    marcados(tipo).length === TODOS_LOS_ESTATUS.length;
  const todosCompletos =
    tipos.length > 0 && tipos.every((t) => tipoCompleto(t.alertaAcronimo));
  const algunoMarcado = tipos.some((t) => marcados(t.alertaAcronimo).length > 0);

  const alternarTodos = () =>
    setSeleccion(
      todosCompletos
        ? {}
        : Object.fromEntries(tipos.map((t) => [t.alertaAcronimo, TODOS_LOS_ESTATUS])),
    );

  const alternarTipo = (tipo: string) =>
    setSeleccion((prev) => ({
      ...prev,
      [tipo]: tipoCompleto(tipo) ? [] : TODOS_LOS_ESTATUS,
    }));

  const alternarEstatus = (tipo: string, estatus: EstatusAlertaRevision) =>
    setSeleccion((prev) => {
      const actuales = prev[tipo] ?? [];
      return {
        ...prev,
        [tipo]: actuales.includes(estatus)
          ? actuales.filter((e) => e !== estatus)
          : TODOS_LOS_ESTATUS.filter((e) => e === estatus || actuales.includes(e)),
      };
    });

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <Popover open={abierto} onOpenChange={abrir}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="gap-2 rounded-full">
            <SlidersHorizontal className="size-4" />
            Filtros
            {activos > 0 ? (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                {activos}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(44rem,calc(100vw-2rem))] rounded-2xl p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAplicar({
                ...filtro,
                alertaAcronimo: undefined,
                estatus: undefined,
                tiposEstatus: tiposEstatusDe(seleccion),
              });
              setAbierto(false);
            }}
            className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto p-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="desde" className={label}>
                  Desde
                </label>
                <CalendarioFecha
                  id="desde"
                  valor={filtro.desde ?? ""}
                  max={filtro.hasta}
                  onCambiar={(fecha) => cambiar("desde", fecha)}
                  permitirBorrar
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="hasta" className={label}>
                  Hasta
                </label>
                <CalendarioFecha
                  id="hasta"
                  valor={filtro.hasta ?? ""}
                  min={filtro.desde}
                  onCambiar={(fecha) => cambiar("hasta", fecha)}
                  permitirBorrar
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="origen" className={label}>
                  Origen
                </label>
                <select
                  id="origen"
                  value={filtro.origen ?? ""}
                  onChange={(e) => cambiar("origen", e.target.value as OrigenAlerta | "")}
                  className={field}
                >
                  <option value="">Todos</option>
                  <option value="AUTOMATICA">Automática (cajas)</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="persona" className={label}>
                  Persona
                </label>
                <input
                  id="persona"
                  value={filtro.persona ?? ""}
                  placeholder="Nombre"
                  onChange={(e) =>
                    cambiar("persona", e.target.value.toLocaleUpperCase("es-MX"))
                  }
                  className={field}
                />
              </div>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className={`${label} mb-2`}>Tipo de alerta y estatus</legend>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-foreground/85">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">
                        <CasillaRedonda
                          marcada={todosCompletos}
                          parcial={algunoMarcado}
                          onCambiar={alternarTodos}
                        >
                          Todos los tipos
                        </CasillaRedonda>
                      </th>
                      {ESTATUS.map((e) => (
                        <th
                          key={e.valor}
                          className="px-3 py-2 text-center text-xs font-semibold"
                        >
                          {e.etiqueta}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tipos.map((t) => (
                      <tr key={t.alertaAcronimo} className="hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <CasillaRedonda
                            marcada={tipoCompleto(t.alertaAcronimo)}
                            parcial={marcados(t.alertaAcronimo).length > 0}
                            onCambiar={() => alternarTipo(t.alertaAcronimo)}
                          >
                            <span className="capitalize">
                              {t.descripcion.toLocaleLowerCase("es-MX")}
                            </span>
                          </CasillaRedonda>
                        </td>
                        {ESTATUS.map((e) => (
                          <td key={e.valor} className="px-3 py-2 text-center">
                            <CasillaRedonda
                              marcada={marcados(t.alertaAcronimo).includes(e.valor)}
                              onCambiar={() => alternarEstatus(t.alertaAcronimo, e.valor)}
                              etiqueta={`${t.descripcion} ${e.etiqueta}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={hint}>
                Sin nada marcado se muestran todos los tipos y estatus.
              </p>
            </fieldset>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSeleccion({});
                  setFiltro((prev) => ({
                    ...prev,
                    origen: undefined,
                    persona: undefined,
                  }));
                }}
              >
                Limpiar
              </Button>
              <Button type="submit">Aplicar filtros</Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>

      <p
        className="text-muted-foreground min-w-0 flex-1 truncate text-sm"
        title={resumen.join(" · ")}
      >
        {resumen.length > 0 ? resumen.join(" · ") : "Todas las alertas"}
      </p>
    </div>
  );
}
