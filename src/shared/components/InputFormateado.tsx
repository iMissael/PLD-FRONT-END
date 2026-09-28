import type { ComponentProps } from "react";
import { Input } from "@/shared/components/ui/input";
import type { Formato } from "@/shared/utils/entradas";

type InputFormateadoProps = Omit<ComponentProps<typeof Input>, "onChange" | "value"> & {
  value: string | undefined;
  /** Recibe el texto ya corregido (no el evento), como `field.onChange` de React Hook Form. */
  onChange: (valor: string) => void;
  /** Corrige lo que se escribe o se pega (mayúsculas, solo dígitos…) antes de entregarlo. */
  formato?: Formato;
};

/**
 * `Input` que aplica un formato mientras se escribe o se pega, conserva la posición del cursor
 * y quita los espacios sobrantes al salir del campo. Pensado para spread de `field`:
 * `<InputFormateado {...field} formato={mayusculas} maxLength={50} />`.
 */
export function InputFormateado({
  value,
  onChange,
  onBlur,
  formato,
  maxLength,
  ...props
}: InputFormateadoProps) {
  return (
    <Input
      {...props}
      value={value ?? ""}
      // Con formato, el largo se recorta después de limpiar el texto: con el atributo
      // maxLength del navegador, pegar "(951) 000-0001" se cortaría antes de quitar los símbolos.
      maxLength={formato ? undefined : maxLength}
      onChange={(evento) => {
        const campo = evento.target;
        const bruto = campo.value;
        if (!formato) return onChange(bruto);
        const corregir = (texto: string) => formato(texto).slice(0, maxLength);
        const inicio = campo.selectionStart;
        onChange(corregir(bruto));
        // Al cambiar el texto el cursor saltaría al final: se vuelve al punto donde se escribía.
        if (inicio !== null) {
          const posicion = corregir(bruto.slice(0, inicio)).length;
          requestAnimationFrame(() => {
            if (document.activeElement === campo) {
              campo.setSelectionRange(posicion, posicion);
            }
          });
        }
      }}
      onBlur={(evento) => {
        const actual = value ?? "";
        if (actual !== actual.trim()) onChange(actual.trim());
        onBlur?.(evento);
      }}
    />
  );
}
