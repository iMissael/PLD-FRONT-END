import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { field } from "@/shared/components/ui/styles";
import { cn } from "@/shared/utils/cn";
import { hoyIso } from "@/shared/utils/fechas";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

interface CalendarioFechaProps {
  id?: string;
  /** Fecha seleccionada como AAAA-MM-DD; "" si no hay. */
  valor: string;
  onCambiar: (fecha: string) => void;
  /** Límites inclusivos como AAAA-MM-DD. */
  min?: string;
  max?: string;
  placeholder?: string;
}

function aIso(anio: number, mes: number, dia: number) {
  return hoyIso(new Date(anio, mes, dia));
}

/** AAAA-MM-DD → DD/MM/AAAA para mostrar. */
function aTexto(iso: string) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

/**
 * Selector de fecha con calendario desplegable. Los días fuera de `min`/`max` no
 * se pueden elegir, y los selectores de mes/año solo ofrecen el rango permitido.
 */
export function CalendarioFecha({
  id,
  valor,
  onCambiar,
  min,
  max,
  placeholder = "Seleccione una fecha",
}: CalendarioFechaProps) {
  const [abierto, setAbierto] = useState(false);
  const hoy = hoyIso();
  const inicial = valor || (max && max < hoy ? max : hoy);
  const [vista, setVista] = useState(() => {
    const [anio, mes] = inicial.split("-").map(Number) as [number, number];
    return { anio, mes: mes - 1 };
  });

  const abrir = (siguiente: boolean) => {
    if (siguiente) {
      const [anio, mes] = inicial.split("-").map(Number) as [number, number];
      setVista({ anio, mes: mes - 1 });
    }
    setAbierto(siguiente);
  };

  const fueraDeRango = (iso: string) => (min && iso < min) || (max && iso > max);
  const anioMin = min ? Number(min.slice(0, 4)) : vista.anio - 10;
  const anioMax = max ? Number(max.slice(0, 4)) : vista.anio + 10;
  const anios = Array.from({ length: anioMax - anioMin + 1 }, (_, i) => anioMax - i);

  const primerDia = aIso(vista.anio, vista.mes, 1);
  const ultimoDia = aIso(vista.anio, vista.mes + 1, 0);
  const puedeAnterior = !min || primerDia > min;
  const puedeSiguiente = !max || ultimoDia < max;

  const moverMes = (delta: number) =>
    setVista(({ anio, mes }) => {
      const fecha = new Date(anio, mes + delta, 1);
      return { anio: fecha.getFullYear(), mes: fecha.getMonth() };
    });

  // Lunes = 0: el calendario empieza la semana en lunes.
  const desfase = (new Date(vista.anio, vista.mes, 1).getDay() + 6) % 7;
  const diasEnMes = new Date(vista.anio, vista.mes + 1, 0).getDate();
  const celdas: (number | null)[] = [
    ...Array<null>(desfase).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  const elegir = (iso: string) => {
    onCambiar(iso);
    setAbierto(false);
  };

  return (
    <Popover open={abierto} onOpenChange={abrir}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(field, "flex items-center justify-between gap-2 text-left")}
        >
          <span className={valor ? "" : "text-muted-foreground"}>
            {valor ? aTexto(valor) : placeholder}
          </span>
          <Calendar className="text-muted-foreground size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <div className="mb-2 flex items-center justify-between gap-1">
          <button
            type="button"
            aria-label="Mes anterior"
            disabled={!puedeAnterior}
            onClick={() => moverMes(-1)}
            className="hover:bg-muted rounded-md p-1 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex gap-1">
            <select
              aria-label="Mes"
              value={vista.mes}
              onChange={(e) => setVista((v) => ({ ...v, mes: Number(e.target.value) }))}
              className="bg-card rounded-md border px-1 py-0.5 text-sm"
            >
              {MESES.map((nombre, i) => (
                <option
                  key={nombre}
                  value={i}
                  disabled={Boolean(
                    fueraDeRango(aIso(vista.anio, i, 1)) &&
                    fueraDeRango(aIso(vista.anio, i + 1, 0)),
                  )}
                >
                  {nombre}
                </option>
              ))}
            </select>
            <select
              aria-label="Año"
              value={vista.anio}
              onChange={(e) => {
                const anio = Number(e.target.value);
                // Si el mes visible queda fuera de rango en el nuevo año, se ajusta al límite.
                let mes = vista.mes;
                if (min && aIso(anio, mes + 1, 0) < min)
                  mes = Number(min.slice(5, 7)) - 1;
                if (max && aIso(anio, mes, 1) > max) mes = Number(max.slice(5, 7)) - 1;
                setVista({ anio, mes });
              }}
              className="bg-card rounded-md border px-1 py-0.5 text-sm"
            >
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            aria-label="Mes siguiente"
            disabled={!puedeSiguiente}
            onClick={() => moverMes(1)}
            className="hover:bg-muted rounded-md p-1 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {DIAS_SEMANA.map((d) => (
            <span key={d} className="text-muted-foreground py-1 font-medium">
              {d}
            </span>
          ))}
          {celdas.map((dia, i) => {
            if (dia === null) return <span key={`vacio-${i}`} />;
            const iso = aIso(vista.anio, vista.mes, dia);
            const seleccionado = iso === valor;
            return (
              <button
                key={iso}
                type="button"
                disabled={Boolean(fueraDeRango(iso))}
                onClick={() => elegir(iso)}
                className={cn(
                  "rounded-md py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-30",
                  seleccionado ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  !seleccionado && iso === hoy && "border-primary border font-semibold",
                )}
              >
                {dia}
              </button>
            );
          })}
        </div>

        {!fueraDeRango(hoy) ? (
          <div className="mt-2 flex justify-end border-t pt-2">
            <button
              type="button"
              onClick={() => elegir(hoy)}
              className="text-primary text-sm font-medium hover:underline"
            >
              Hoy
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
