import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Alert, Card } from "@/shared/components/molecules";
import { emptyState, hint, table } from "@/shared/styles/tokens";

import { useGuardarPlazos, usePlazosAlerta } from "../hooks/useParametrosAlerta";
import type { PlazosTipoAlerta, VentanaEnvio } from "../types/parametrosAlerta";
import {
  MESES,
  parteDelMes,
  textoVentana,
  ventanaDesde,
  type ParteDelMes,
} from "../utils/formatoParametros";

const selectStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-xl border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50";

const NO_APLICA = <span className="text-muted-foreground">No aplica</span>;

function mismaVentanas(a: VentanaEnvio[], b: VentanaEnvio[]) {
  return (
    a.length === b.length &&
    a.every((v, i) => v.mes === b[i]?.mes && v.maximoDias === b[i]?.maximoDias)
  );
}

function FilaPlazos({
  plazos,
  puedeEditar,
}: {
  plazos: PlazosTipoAlerta;
  puedeEditar: boolean;
}) {
  const guardar = useGuardarPlazos();
  const [dictamen, setDictamen] = useState(String(plazos.limiteDictamenDias));
  const [reporte, setReporte] = useState(String(plazos.envioReporteDias));
  const [ventanas, setVentanas] = useState<VentanaEnvio[]>(plazos.ventanasEnvio);

  useEffect(() => {
    setDictamen(String(plazos.limiteDictamenDias));
    setReporte(String(plazos.envioReporteDias));
    setVentanas(plazos.ventanasEnvio);
  }, [plazos]);

  const cambio =
    Number(dictamen) !== plazos.limiteDictamenDias ||
    Number(reporte) !== plazos.envioReporteDias ||
    !mismaVentanas(ventanas, plazos.ventanasEnvio);

  const editable =
    puedeEditar && (plazos.editaDictamen || plazos.editaReporte || plazos.editaVentanas);

  const actualizarVentana = (
    indice: number,
    mes: number,
    parte: ParteDelMes,
    dias: number,
  ) =>
    setVentanas((prev) =>
      prev.map((v, i) => (i === indice ? ventanaDesde(mes, parte, dias) : v)),
    );

  const agregarVentana = () => {
    const libre = Array.from({ length: 12 }, (_, i) => i + 1).find(
      (m) => !ventanas.some((v) => v.mes === m),
    );
    if (libre) setVentanas((prev) => [...prev, { mes: libre, maximoDias: -10 }]);
  };

  const handleGuardar = () => {
    guardar.mutate(
      {
        acronimo: plazos.alertaAcronimo,
        input: {
          limiteDictamenDias: plazos.editaDictamen ? Number(dictamen) : undefined,
          envioReporteDias: plazos.editaReporte ? Number(reporte) : undefined,
          ventanasEnvio: plazos.editaVentanas ? ventanas : undefined,
        },
      },
      {
        onSuccess: () =>
          toast.success(
            `Plazos de ${plazos.descripcion.toLocaleLowerCase("es-MX")} guardados.`,
          ),
        onError: (error) =>
          toast.error(isAppError(error) ? error.message : "Ocurrió un error inesperado."),
      },
    );
  };

  return (
    <tr className="align-top">
      <td className={table.cellStrong}>
        {plazos.descripcion}
        <span className="text-muted-foreground ml-1 text-xs font-normal">
          ({plazos.alertaAcronimo})
        </span>
      </td>
      <td className={table.cell}>
        {plazos.editaDictamen ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              aria-label={`Días para dictaminar ${plazos.descripcion}`}
              min={1}
              max={365}
              value={dictamen}
              onChange={(e) => setDictamen(e.target.value)}
              disabled={!puedeEditar}
              className="w-20 rounded-xl"
            />
            <span className={hint}>naturales</span>
          </div>
        ) : (
          NO_APLICA
        )}
      </td>
      <td className={table.cell}>
        {plazos.editaReporte ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              aria-label={`Días hábiles para reportar ${plazos.descripcion}`}
              min={1}
              max={30}
              value={reporte}
              onChange={(e) => setReporte(e.target.value)}
              disabled={!puedeEditar}
              className="w-20 rounded-xl"
            />
            <span className={hint}>hábiles</span>
          </div>
        ) : (
          NO_APLICA
        )}
      </td>
      <td className={table.cell}>
        {!plazos.editaVentanas ? (
          NO_APLICA
        ) : !puedeEditar ? (
          <ul className="flex flex-col gap-1">
            {ventanas.map((v) => (
              <li key={v.mes}>{textoVentana(v)}</li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-2">
            {ventanas.map((v, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Mes"
                  value={v.mes}
                  onChange={(e) =>
                    actualizarVentana(
                      i,
                      Number(e.target.value),
                      parteDelMes(v),
                      Math.abs(v.maximoDias),
                    )
                  }
                  className={selectStyle}
                >
                  {MESES.map((nombre, m) => (
                    <option
                      key={nombre}
                      value={m + 1}
                      disabled={ventanas.some((o, j) => j !== i && o.mes === m + 1)}
                    >
                      {nombre}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Parte del mes"
                  value={parteDelMes(v)}
                  onChange={(e) =>
                    actualizarVentana(
                      i,
                      v.mes,
                      e.target.value as ParteDelMes,
                      Math.abs(v.maximoDias),
                    )
                  }
                  className={selectStyle}
                >
                  <option value="primeros">Primeros</option>
                  <option value="ultimos">Últimos</option>
                </select>
                <Input
                  type="number"
                  aria-label="Días de la ventana"
                  min={1}
                  max={31}
                  value={Math.abs(v.maximoDias)}
                  onChange={(e) =>
                    actualizarVentana(i, v.mes, parteDelMes(v), Number(e.target.value))
                  }
                  className="w-16 rounded-xl"
                />
                <span className={hint}>días</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar ${MESES[v.mes - 1]}`}
                  onClick={() => setVentanas((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded-full"
                >
                  <X />
                </Button>
              </div>
            ))}
            {ventanas.length < 12 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarVentana}
                className="w-fit rounded-full"
              >
                <Plus /> Agregar mes
              </Button>
            ) : null}
          </div>
        )}
      </td>
      <td className={`${table.cell} text-right`}>
        {editable ? (
          <Button
            type="button"
            size="sm"
            disabled={!cambio || guardar.isPending}
            onClick={handleGuardar}
            className="rounded-full px-4"
          >
            {guardar.isPending ? "Guardando…" : "Guardar"}
          </Button>
        ) : null}
      </td>
    </tr>
  );
}

export function PlazosTiposSection({ puedeEditar }: { puedeEditar: boolean }) {
  const { data, isLoading, isError } = usePlazosAlerta();

  return (
    <Card className="gap-4 px-6">
      <div>
        <h3 className="text-foreground text-base font-semibold">
          Plazos por tipo de alerta
        </h3>
        <p className={hint}>
          Días para dictaminar desde que se genera la alerta, días hábiles para reportarla
          a la CNBV después de confirmarla y meses del reporte trimestral de relevantes.
        </p>
      </div>
      {isError ? <Alert>No se pudieron cargar los plazos.</Alert> : null}
      {isLoading ? (
        <div className={emptyState}>Cargando plazos…</div>
      ) : (
        <div className={table.wrapper}>
          <div className="overflow-x-auto">
            <table className={table.root}>
              <thead className={table.head}>
                <tr>
                  <th className={table.headCell}>Tipo</th>
                  <th className={table.headCell}>Dictamen</th>
                  <th className={table.headCell}>Reporte a la CNBV</th>
                  <th className={table.headCell}>Ventana del trimestral</th>
                  <th className={table.headCell} />
                </tr>
              </thead>
              <tbody className={table.body}>
                {(data ?? []).map((p) => (
                  <FilaPlazos
                    key={p.alertaAcronimo}
                    plazos={p}
                    puedeEditar={puedeEditar}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
