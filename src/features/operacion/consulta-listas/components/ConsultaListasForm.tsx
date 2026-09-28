import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useConsultarListas } from "@/features/operacion/consulta-listas/hooks/useConsultaListas";
import {
  consultaListasSchema,
  type ConsultaListasFormValues,
} from "@/features/operacion/consulta-listas/types/consultaListasSchema";
import type { ConsultaLista } from "@/features/operacion/consulta-listas/types/Quienesquien";
import { useAuthStore } from "@/shared/auth/authStore";
import { useSucursalActivaStore } from "@/shared/auth/sucursalActivaStore";

function aTextoOIndefinido(valor: string | undefined) {
  return valor ? valor : undefined;
}

export function ConsultaListasForm({
  onResultados,
}: {
  onResultados: (resultados: ConsultaLista[]) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const consultarListas = useConsultarListas();

  const form = useForm<ConsultaListasFormValues>({
    resolver: zodResolver(consultaListasSchema),
    defaultValues: {
      nombreCompleto: "",
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      rfc: "",
      curp: "",
      tipoPersona: "",
    },
  });

  function onSubmit(values: ConsultaListasFormValues) {
    const verificadoPor = useAuthStore.getState().usuario?.id;
    const sucursalId = useSucursalActivaStore.getState().sucursalActiva?.id;

    if (!verificadoPor || !sucursalId) {
      toast.error("No se pudo determinar el usuario o la sucursal activa.");
      return;
    }

    setEnviando(true);
    consultarListas.mutate(
      {
        nombreCompleto: aTextoOIndefinido(values.nombreCompleto),
        nombre: aTextoOIndefinido(values.nombre),
        primerApellido: aTextoOIndefinido(values.primerApellido),
        segundoApellido: aTextoOIndefinido(values.segundoApellido),
        rfc: aTextoOIndefinido(values.rfc),
        curp: aTextoOIndefinido(values.curp),
        tipoPersona: aTextoOIndefinido(values.tipoPersona),
        verificadoPor,
        sucursalId,
      },
      {
        onSuccess: (resultados) => {
          onResultados(resultados);
          toast.success("Consulta realizada correctamente");
        },
        onError: () => {
          toast.error("No se pudo completar la consulta de listas");
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
            name="nombreCompleto"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez Gómez" {...field} />
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
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre(s)</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
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
                  <Input placeholder="Pérez" {...field} />
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
                  <Input placeholder="Gómez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rfc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFC</FormLabel>
                <FormControl>
                  <Input placeholder="PEGJ800101ABC" {...field} />
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
                  <Input placeholder="PEGJ800101HDFRZN01" {...field} />
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
    </Form>
  );
}
