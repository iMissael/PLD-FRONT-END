import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { useSucursalActivaStore } from "@/shared/auth/sucursalActivaStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

export function SeleccionarSucursalPage() {
  const navigate = useNavigate();
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  const { data: sucursales, isLoading, isError } = useSucursales();
  const setSucursalActiva = useSucursalActivaStore((s) => s.setSucursalActiva);
  const [entrando, setEntrando] = useState<{ id: string; nombre: string } | null>(null);

  useEffect(() => {
    if (!entrando) return;
    const timeout = setTimeout(() => {
      navigate(rutaTenant(tenantId), { replace: true });
    }, 1200);
    return () => clearTimeout(timeout);
  }, [entrando, navigate, tenantId]);

  function elegirSucursal(id: string, nombre: string) {
    setSucursalActiva({ id, nombre });
    setEntrando({ id, nombre });
  }

  if (entrando) {
    return (
      <div className="from-brand-mint to-brand-teal flex min-h-svh flex-col items-center justify-center gap-4 bg-gradient-to-br px-4">
        <div className="relative flex items-center justify-center">
          <ShieldCheck
            className="animate-shield-ring absolute size-20 text-white"
            strokeWidth={1.5}
          />
          <ShieldCheck
            className="animate-shield-pop relative size-20 text-white drop-shadow"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-lg font-semibold text-white drop-shadow">
          Entrando a {entrando.nombre}…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="bg-card w-full max-w-lg space-y-6 rounded-2xl border p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-primary text-2xl font-bold">Elige tu sucursal</h1>
          <p className="text-muted-foreground text-sm">
            Selecciona la sucursal en la que vas a trabajar hoy.
          </p>
        </div>

        {isLoading && (
          <p className="text-muted-foreground text-center text-sm">
            Cargando sucursales…
          </p>
        )}
        {isError && (
          <p className="text-destructive text-center text-sm">
            No se pudieron cargar las sucursales.
          </p>
        )}

        {sucursales && sucursales.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sucursales.map((sucursal) => (
                <TableRow key={sucursal.id}>
                  <TableCell className="font-medium">{sucursal.codigoSucursal}</TableCell>
                  <TableCell>{sucursal.nombre}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() =>
                        sucursal.id && elegirSucursal(sucursal.id, sucursal.nombre ?? "")
                      }
                    >
                      Entrar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
