import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/shared/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/molecules/Card";

export function RouteErrorPage() {
  const error = useRouteError();

  const esModuloDinamico =
    error instanceof Error &&
    (error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed"));

  const mensaje = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Ocurrió un error inesperado al cargar la vista.";

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md w-full border-border/80 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <AlertTriangle className="size-6" />
          </div>
          <CardTitle className="text-lg">
            {esModuloDinamico ? "Actualización de la aplicación" : "Error al cargar la página"}
          </CardTitle>
          <CardDescription>
            {esModuloDinamico
              ? "Se detectaron cambios en la aplicación o el servidor de desarrollo se reinició. Recarga la página para continuar."
              : mensaje}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2 pt-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Recargar página
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const segmentos = window.location.pathname.split("/").filter(Boolean);
              const pldIdx = segmentos.findIndex((s) => s.toUpperCase() === "PLD");
              if (pldIdx !== -1 && segmentos.length > pldIdx + 1) {
                window.location.href = `/${segmentos.slice(0, pldIdx + 2).join("/")}`;
              } else {
                window.location.href = "/";
              }
            }}
            className="flex items-center gap-2"
          >
            <Home className="size-4" />
            Ir al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
