import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/CatalogoButton";

import type { CredencialEmitidaResponse } from "../types/integraciones";

interface SecretoEmitidoProps {
  emitida: CredencialEmitidaResponse;
  onCerrar: () => void;
}

/**
 * Muestra el client_secret recién emitido. Es la única vez que se puede ver: el backend solo
 * guarda su hash. Al cerrar se descarta de la memoria de la pantalla.
 */
export function SecretoEmitido({ emitida, onCerrar }: SecretoEmitidoProps) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async (texto: string, que: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      if (que === "secreto") setCopiado(true);
      toast.success(`${que === "secreto" ? "client_secret" : "client_id"} copiado`);
    } catch {
      toast.error("No se pudo copiar; selecciona el texto y cópialo a mano.");
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-warning/40 bg-warning-soft p-4" role="alert">
      <p className="text-sm font-semibold text-warning">Guarda el client_secret ahora: no se vuelve a mostrar.</p>
      <p className="text-xs text-muted-foreground">
        Entrégalo al equipo del sistema por un canal seguro. Si se pierde, emite otra credencial y revoca esta.
      </p>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <dt className="font-medium">client_id</dt>
        <dd>
          <code className="break-all">{emitida.clientId}</code>
        </dd>
        <dd>
          <Button type="button" variante="secundario" className="px-3 py-1 text-xs" onClick={() => copiar(emitida.clientId, "id")}>
            Copiar
          </Button>
        </dd>
        <dt className="font-medium">client_secret</dt>
        <dd>
          <code className="break-all select-all">{emitida.clientSecret}</code>
        </dd>
        <dd>
          <Button
            type="button"
            variante="secundario"
            className="px-3 py-1 text-xs"
            onClick={() => copiar(emitida.clientSecret, "secreto")}
          >
            Copiar
          </Button>
        </dd>
      </dl>
      <Button type="button" className="self-end" onClick={onCerrar}>
        {copiado ? "Ya lo guardé" : "Cerrar"}
      </Button>
    </div>
  );
}
