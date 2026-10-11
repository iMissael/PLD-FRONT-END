import { Search, UserRound } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import type { ComponentProps, ElementType, KeyboardEvent, ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { InputFormateado } from "@/shared/components/InputFormateado";
import { Input } from "@/shared/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  CLASE_CODIGO,
  CLASE_CONTROL,
  CLASE_ETIQUETA,
} from "@/features/configuraciones/oficial-cumplimiento/components/estilos";
import type { OficialCumplimientoFormValues } from "@/features/configuraciones/oficial-cumplimiento/types/oficialCumplimientoSchema";
import type { Formato } from "@/shared/utils/entradas";
import { generoConocido } from "@/features/configuraciones/oficial-cumplimiento/utils/oficialCumplimiento";
import { cn } from "@/shared/utils/cn";

export type FichaForm = UseFormReturn<OficialCumplimientoFormValues>;
export type CampoNombre = keyof OficialCumplimientoFormValues;

export interface OpcionCatalogo {
  valor: string;
  etiqueta: string;
  /** Clave del catálogo (INEGI, ISO…), se muestra junto al nombre. */
  codigo?: string;
}

const LIMITE_RESULTADOS = 100;

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function EtiquetaCampo({
  texto,
  requerido,
  icono: Icono,
}: {
  texto: string;
  requerido?: boolean;
  icono?: ElementType;
}) {
  return (
    <FormLabel className={cn(CLASE_ETIQUETA, Icono && "text-primary")}>
      {Icono && <Icono className="size-3.5" />}
      {texto}
      {requerido && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
    </FormLabel>
  );
}

export function CampoTexto({
  form,
  name,
  label,
  requerido,
  icono: Icono,
  sufijo,
  formato,
  maxLength,
  className,
  ...inputProps
}: {
  form: FichaForm;
  name: CampoNombre;
  label: string;
  requerido?: boolean;
  icono?: ElementType;
  /** Texto de apoyo dentro del campo, a la derecha (por ejemplo, el nombre de la moneda). */
  sufijo?: string | null;
  /** Corrige lo que se escribe o se pega (mayúsculas, solo dígitos…) antes de guardarlo en el formulario. */
  formato?: Formato;
  className?: string;
} & Omit<ComponentProps<typeof Input>, "name" | "form">) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <EtiquetaCampo texto={label} requerido={requerido} />
          <div className="relative">
            {Icono && (
              <Icono className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            )}
            <FormControl>
              <InputFormateado
                autoComplete="off"
                {...inputProps}
                {...field}
                formato={formato}
                maxLength={maxLength}
                className={cn(CLASE_CONTROL, Icono && "pl-9", sufijo && "pr-44")}
              />
            </FormControl>
            {sufijo && (
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">
                {sufijo}
              </span>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CampoSelect({
  form,
  name,
  label,
  placeholder,
  opciones,
  requerido,
  icono,
  alCambiar,
  className,
}: {
  form: FichaForm;
  name: CampoNombre;
  label: string;
  placeholder: string;
  opciones: OpcionCatalogo[];
  requerido?: boolean;
  icono?: ElementType;
  alCambiar?: (valor: string) => void;
  className?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <EtiquetaCampo texto={label} requerido={requerido} icono={icono} />
          <Select
            onValueChange={(valor) => {
              field.onChange(valor);
              alCambiar?.(valor);
            }}
            value={field.value ?? ""}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  CLASE_CONTROL,
                  "w-full data-[size=default]:h-10",
                  icono && "border-primary/30 bg-primary-soft/30",
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {opciones.map((opcion) => (
                <SelectItem key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Catálogo con clave y lupa: al abrirla se busca por nombre o clave dentro del catálogo. */
export function CampoCatalogo({
  form,
  name,
  label,
  placeholder,
  opciones,
  requerido,
  deshabilitado,
  cargando,
  alCambiar,
  accion,
  ayuda,
  className,
}: {
  form: FichaForm;
  name: CampoNombre;
  label: string;
  placeholder: string;
  opciones: OpcionCatalogo[];
  requerido?: boolean;
  deshabilitado?: boolean;
  /** El catálogo aún se está descargando: se avisa en lugar de mostrar el campo vacío. */
  cargando?: boolean;
  alCambiar?: (valor: string) => void;
  accion?: ReactNode;
  ayuda?: ReactNode;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);
  const idLista = useId();

  const indice = useMemo(
    () =>
      opciones.map((opcion) => ({
        opcion,
        texto: normalizar(`${opcion.codigo ?? ""} ${opcion.etiqueta}`),
      })),
    [opciones],
  );
  const coincidencias = useMemo(() => {
    const buscado = normalizar(busqueda.trim());
    return buscado ? indice.filter((item) => item.texto.includes(buscado)) : indice;
  }, [indice, busqueda]);
  const visibles = coincidencias.slice(0, LIMITE_RESULTADOS);

  function cambiarApertura(siguiente: boolean) {
    setAbierto(siguiente);
    if (siguiente) setBusqueda("");
  }

  function moverFoco(evento: KeyboardEvent<HTMLElement>) {
    const opcionesDom = Array.from(
      listaRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    );
    const actual = opcionesDom.indexOf(document.activeElement as HTMLElement);
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      opcionesDom[Math.min(actual + 1, opcionesDom.length - 1)]?.focus();
    } else if (evento.key === "ArrowUp" && actual > 0) {
      evento.preventDefault();
      opcionesDom[actual - 1]?.focus();
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const actual = opciones.find((opcion) => opcion.valor === field.value);

        function elegir(valor: string) {
          field.onChange(valor);
          alCambiar?.(valor);
          setAbierto(false);
        }

        return (
          <FormItem className={className}>
            <EtiquetaCampo texto={label} requerido={requerido} />
            <div className="flex items-center gap-2">
              <Popover open={abierto} onOpenChange={cambiarApertura}>
                <div className="flex min-w-0 flex-1 rounded-lg shadow-xs">
                  {actual?.codigo && (
                    <span className={CLASE_CODIGO}>{actual.codigo}</span>
                  )}
                  <FormControl>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={deshabilitado}
                        aria-haspopup="listbox"
                        title={`Buscar en el catálogo: ${label}`}
                        className={cn(
                          "aria-invalid:border-destructive flex h-10 min-w-0 flex-1 items-center justify-between gap-2 border border-slate-300 bg-slate-50 dark:border-border dark:bg-card px-3 text-left text-sm font-semibold text-slate-800 dark:text-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors",
                          deshabilitado
                            ? "cursor-not-allowed bg-muted/80 text-muted-foreground border-border/60 opacity-70"
                            : "hover:bg-slate-100/80 dark:hover:bg-muted/30 cursor-pointer",
                          actual?.codigo ? "rounded-r-lg" : "rounded-lg",
                        )}
                      >
                        <span
                          className={cn(
                            "truncate",
                            !actual && "font-normal text-muted-foreground",
                          )}
                        >
                          {actual?.etiqueta ??
                            (field.value && cargando ? "Cargando…" : placeholder)}
                        </span>
                        <Search className="text-muted-foreground size-4 shrink-0" />
                      </button>
                    </PopoverTrigger>
                  </FormControl>
                </div>
                <PopoverContent className="w-[max(var(--radix-popover-trigger-width),20rem)] p-0 shadow-lg">
                  <div className="border-b border-border p-2.5 bg-muted/40">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1 pb-1.5">
                      Seleccionar {label}
                    </p>
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                        onKeyDown={(evento) => {
                          if (evento.key === "Enter") {
                            evento.preventDefault();
                            if (visibles[0]) elegir(visibles[0].opcion.valor);
                          } else moverFoco(evento);
                        }}
                        placeholder="Buscar por nombre o clave…"
                        aria-label={`Buscar en ${label}`}
                        aria-controls={idLista}
                        className="h-9 pl-8 text-xs bg-background"
                      />
                    </div>
                  </div>
                  <div
                    ref={listaRef}
                    id={idLista}
                    role="listbox"
                    aria-label={label}
                    onKeyDown={moverFoco}
                    className="max-h-64 overflow-y-auto p-1"
                  >
                    {visibles.map(({ opcion }) => (
                      <button
                        key={opcion.valor}
                        type="button"
                        role="option"
                        aria-selected={opcion.valor === field.value}
                        onClick={() => elegir(opcion.valor)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-slate-100 focus-visible:bg-slate-100 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800",
                          opcion.valor === field.value && "bg-primary-soft dark:bg-slate-800 font-semibold",
                        )}
                      >
                        {opcion.codigo && (
                          <span className="min-w-10 font-mono text-xs text-slate-500">
                            {opcion.codigo}
                          </span>
                        )}
                        <span className="truncate">{opcion.etiqueta}</span>
                      </button>
                    ))}
                    {visibles.length === 0 && (
                      <p className="px-2 py-3 text-center text-sm text-slate-500">
                        {cargando
                          ? "Cargando catálogo…"
                          : opciones.length === 0
                            ? "El catálogo no tiene opciones."
                            : "Sin resultados para esa búsqueda."}
                      </p>
                    )}
                  </div>
                  {coincidencias.length > LIMITE_RESULTADOS && (
                    <p className="border-t px-3 py-1.5 text-xs text-slate-500">
                      Mostrando {LIMITE_RESULTADOS} de {coincidencias.length}. Escribe
                      para acotar.
                    </p>
                  )}
                </PopoverContent>
              </Popover>
              {accion}
            </div>
            {ayuda && <p className="text-[11px] text-slate-500 italic">{ayuda}</p>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

const OPCIONES_GENERO = ["Masculino", "Femenino"] as const;

/** El género es texto libre en el backend: se ofrece Masculino / Femenino y se respeta cualquier otro valor ya guardado. */
export function CampoGenero({
  form,
  className,
}: {
  form: FichaForm;
  className?: string;
}) {
  return (
    <FormField
      control={form.control}
      name="genero"
      render={({ field }) => {
        const valor = field.value ?? "";
        const conocido = generoConocido(valor);
        const segmentos: string[] = [...OPCIONES_GENERO];
        if (valor && !conocido) segmentos.push(valor);

        return (
          <FormItem className={className}>
            <EtiquetaCampo texto="Género" />
            <div
              role="radiogroup"
              aria-label="Género"
              className="flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-border dark:bg-card"
            >
              <UserRound className="text-primary mx-1.5 size-4 shrink-0" />
              {segmentos.map((segmento) => {
                const activo = conocido ? conocido === segmento : valor === segmento;
                return (
                  <button
                    key={segmento}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => field.onChange(segmento.toUpperCase())}
                    className={cn(
                      "h-full flex-1 truncate rounded-md px-2 text-xs font-bold outline-none focus-visible:ring-ring/40 focus-visible:ring-2",
                      activo
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800",
                    )}
                  >
                    {segmento}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// El ícono de cada sección es decorativo: acento o neutro, nunca un color de
// estado (ámbar, verde, rojo), que solo se usan para comunicar resultado.
const TONOS_SECCION = {
  acento: "bg-primary-soft text-primary",
  pizarra: "bg-slate-200 text-slate-700",
} as const;

export function SeccionFicha({
  icono: Icono,
  titulo,
  descripcion,
  tono = "acento",
  insignia,
  children,
}: {
  icono: ElementType;
  titulo: string;
  descripcion: string;
  tono?: keyof typeof TONOS_SECCION;
  insignia?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card print:break-inside-avoid print:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4 dark:border-border dark:from-slate-900/40 dark:to-card">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              TONOS_SECCION[tono],
            )}
          >
            <Icono className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-foreground">
              {titulo}
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground">{descripcion}</p>
          </div>
        </div>
        {insignia}
      </div>
      <div className="space-y-6 p-6">{children}</div>
    </section>
  );
}

export function InsigniaSeccion({
  tono = "neutra",
  children,
}: {
  tono?: "neutra" | "ok";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        tono === "ok"
          ? "border-success/30 bg-success-soft text-success-hover font-semibold"
          : "border-slate-200 bg-slate-100 text-slate-600 dark:border-border dark:bg-slate-800 dark:text-slate-300",
      )}
    >
      {children}
    </span>
  );
}
