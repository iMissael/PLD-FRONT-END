import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/shared/auth/authStore";
import { Button } from "@/shared/components/atoms/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/molecules/Popover";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";

import {
  useMarcarLeida,
  useMarcarTodasLeidas,
  useNoLeidas,
  useNotificaciones,
} from "../hooks/useNotificaciones";
import type { Notificacion } from "../types/notificaciones";
import { textoGlobo } from "../utils/tiempoRelativo";
import { ItemNotificacion } from "./ItemNotificacion";

export function CampanaNotificaciones() {
  const puedeVer = useAuthStore((estado) => estado.hasPermission("alertas", "ver"));
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();
  const rutaEnTenant = useRutaTenant();
  const { data: noLeidas = 0 } = useNoLeidas(puedeVer);
  const { data, isLoading } = useNotificaciones(false, 0, 6, puedeVer && abierto);
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();

  if (!puedeVer) return null;

  const abrir = (notificacion: Notificacion) => {
    if (!notificacion.leida) marcarLeida.mutate(notificacion.id);
    setAbierto(false);
    if (notificacion.enlace) navigate(rutaEnTenant(notificacion.enlace));
  };

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : "Notificaciones"
          }
          className="relative rounded-full"
        >
          <Bell className="size-5" />
          {noLeidas > 0 ? (
            <span className="bg-destructive absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {textoGlobo(noLeidas)}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl p-0"
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <span className="text-foreground text-sm font-semibold">Notificaciones</span>
          {noLeidas > 0 ? (
            <button
              type="button"
              onClick={() => marcarTodas.mutate()}
              disabled={marcarTodas.isPending}
              className="text-primary text-xs font-medium hover:underline disabled:opacity-50"
            >
              Marcar todas como leídas
            </button>
          ) : null}
        </div>
        <div className="flex max-h-96 flex-col gap-1 overflow-y-auto p-2">
          {isLoading ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              Cargando…
            </p>
          ) : (data?.contenido ?? []).length === 0 ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              No tienes notificaciones.
            </p>
          ) : (
            (data?.contenido ?? []).map((n) => (
              <ItemNotificacion key={n.id} notificacion={n} onAbrir={abrir} />
            ))
          )}
        </div>
        <div className="border-border border-t p-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-xl"
            onClick={() => {
              setAbierto(false);
              navigate(rutaEnTenant("notificaciones"));
            }}
          >
            Ver todas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
