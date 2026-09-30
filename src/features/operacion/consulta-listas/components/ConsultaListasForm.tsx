import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { InputFormateado } from "@/shared/components/InputFormateado";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { alfanumerico, nombrePropio, rfc } from "@/shared/utils/entradas";
import { useConsultarListas } from "@/features/operacion/consulta-listas/hooks/useConsultaListas";
import {
  consultaListasSchema,
  type ConsultaListasFormValues,
} from "@/features/operacion/consulta-listas/types/consultaListasSchema";
import type { ConsultaLista } from "@/features/operacion/consulta-listas/types/Quienesquien";
import { useAuthStore } from "@/shared/auth/authStore";

function aTextoOIndefinido(valor: string | undefined) {
  return valor ? valor : undefined;
}

function calcularEdad(fechaNacimiento: string | undefined): string {
  if (!fechaNacimiento) return "";
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad -= 1;

  return edad >= 0 ? String(edad) : "";
}

export function ConsultaListasForm({
  onResultados,
}: {
  onResultados: (resultados: ConsultaLista[], proveedorExternoNoDisponible: boolean) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [errorServicio, setErrorServicio] = useState(false);
  const consultarListas = useConsultarListas();

  const form = useForm<ConsultaListasFormValues>({
    resolver: zodResolver(consultaListasSchema),
    defaultValues: {
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      fechaNacimiento: "",
      rfc: "",
      curp: "",
      tipoPersona: "",
    },
  });

  const edad = calcularEdad(form.watch("fechaNacimiento"));

  function onSubmit(values: ConsultaListasFormValues) {
    const verificadoPor = useAuthStore.getState().usuario?.id;

    if (!verificadoPor) {
      toast.error("No se pudo determinar el usuario.");
      return;
    }

    const nombreCompleto = [values.nombre, values.primerApellido, values.segundoApellido]
      .filter((parte) => parte && parte.trim().length > 0)
      .join(" ");

    setEnviando(true);
    consultarListas.mutate(
      {
        nombreCompleto,
        nombre: aTextoOIndefinido(values.nombre),
        primerApellido: aTextoOIndefinido(values.primerApellido),
        segundoApellido: aTextoOIndefinido(values.segundoApellido),
        rfc: aTextoOIndefinido(values.rfc),
        curp: aTextoOIndefinido(values.curp),
        tipoPersona: aTextoOIndefinido(values.tipoPersona),
        verificadoPor,
      },
      {
        onSuccess: (respuesta) => {
          onResultados(respuesta.resultados, respuesta.proveedorExternoNoDisponible);
          if (respuesta.proveedorExternoNoDisponible) {
            toast.warning(
              "El proveedor externo de listas no respondió: la verificación quedó incompleta.",
            );
          } else {
            toast.success("Consulta realizada correctamente");
          }
        },
        onError: () => {
          setErrorServicio(true);
        },
        onSettled: () => setEnviando(false),
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre(s)</FormLabel>
                <FormControl>
                  <InputFormateado placeholder="Juan" {...field} formato={nombrePropio} maxLength={150} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="primerApellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primer apellido</FormLabel>
                <FormControl>
                  <InputFormateado placeholder="Pérez" {...field} formato={nombrePropio} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="segundoApellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segundo apellido</FormLabel>
                <FormControl>
                  <InputFormateado placeholder="Gómez" {...field} formato={nombrePropio} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoPersona"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de persona</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FISICA">Persona física</SelectItem>
                    <SelectItem value="MORAL">Persona moral</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Edad</FormLabel>
            <FormControl>
              <Input value={edad} placeholder="—" disabled />
            </FormControl>
          </FormItem>
          <FormField
            control={form.control}
            name="rfc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFC</FormLabel>
                <FormControl>
                  <InputFormateado placeholder="PEGJ800101ABC" {...field} formato={rfc} maxLength={13} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="curp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CURP</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="PEGJ800101HDFRZN01"
                    {...field}
                    formato={alfanumerico}
                    maxLength={18}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={enviando}>
          {enviando ? "Consultando…" : "Consultar"}
        </Button>
      </form>

      <AlertDialog open={errorServicio} onOpenChange={setErrorServicio}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No se pudo completar la consulta</AlertDialogTitle>
            <AlertDialogDescription>El servicio de API no funciona</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
