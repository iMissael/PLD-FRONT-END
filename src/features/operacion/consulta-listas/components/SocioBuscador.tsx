import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import type { ConsultaListasFormValues } from "@/features/operacion/consulta-listas/types/consultaListasSchema";
import { useBuscarSocios } from "@/features/socios/hooks/useSocios";

export function SocioBuscador({
  form,
}: {
  form: UseFormReturn<ConsultaListasFormValues>;
}) {
  const [busqueda, setBusqueda] = useState("");
  const socioRef = form.watch("socioRef");
  const socioNombre = form.watch("socioNombre");
  const { data: socios, isFetching } = useBuscarSocios(busqueda);

  function elegirSocio(id: string, nombre: string) {
    form.setValue("socioRef", id, { shouldValidate: true });
    form.setValue("socioNombre", nombre);
    setBusqueda("");
  }

  function cambiarSocio() {
    form.setValue("socioRef", "", { shouldValidate: true });
    form.setValue("socioNombre", "");
  }

  if (socioRef) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {socioNombre || socioRef}
        </Badge>
        <button
          type="button"
          onClick={cambiarSocio}
          className="text-muted-foreground text-xs underline underline-offset-2"
        >
          Cambiar socio
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        placeholder="Buscar socio por nombre…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {busqueda.trim().length >= 2 && (
        <div className="bg-popover absolute z-10 mt-1 w-full rounded-md border shadow-md">
          {isFetching && <p className="text-muted-foreground p-2 text-sm">Buscando…</p>}
          {!isFetching && socios?.length === 0 && (
            <p className="text-muted-foreground p-2 text-sm">Sin resultados.</p>
          )}
          {socios?.map((socio) => (
            <button
              key={socio.id}
              type="button"
              onClick={() => elegirSocio(socio.id ?? "", socio.nombre ?? "")}
              className="hover:bg-accent flex w-full flex-col items-start px-3 py-2 text-left text-sm"
            >
              <span className="font-medium">{socio.nombre}</span>
              <span className="text-muted-foreground text-xs">
                {socio.id} · {socio.rfc}
              </span>
            </button>
          ))}
        </div>
      )}
      {form.formState.errors.socioRef && (
        <p className="text-destructive mt-1 text-sm">
          {form.formState.errors.socioRef.message}
        </p>
      )}
    </div>
  );
}
