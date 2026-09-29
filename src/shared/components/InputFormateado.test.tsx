import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InputFormateado } from "@/shared/components/InputFormateado";
import { mayusculas, soloDigitos, type Formato } from "@/shared/utils/entradas";

function Campo({ formato, maxLength }: { formato?: Formato; maxLength?: number }) {
  const [valor, setValor] = useState("");
  return (
    <label>
      Campo
      <InputFormateado
        value={valor}
        onChange={setValor}
        formato={formato}
        maxLength={maxLength}
      />
    </label>
  );
}

describe("InputFormateado", () => {
  it("pasa a mayúsculas mientras se escribe", async () => {
    render(<Campo formato={mayusculas} />);
    await userEvent.type(screen.getByLabelText("Campo"), "juan pérez");
    expect(screen.getByLabelText("Campo")).toHaveValue("JUAN PÉREZ");
  });

  it("al pegar un teléfono con formato conserva los 10 dígitos (no lo trunca antes de limpiarlo)", async () => {
    render(<Campo formato={soloDigitos} maxLength={10} />);
    await userEvent.click(screen.getByLabelText("Campo"));
    await userEvent.paste("(951) 000-0001");
    expect(screen.getByLabelText("Campo")).toHaveValue("9510000001");
  });

  it("recorta al largo máximo después de aplicar el formato", async () => {
    render(<Campo formato={soloDigitos} maxLength={5} />);
    await userEvent.type(screen.getByLabelText("Campo"), "123456789");
    expect(screen.getByLabelText("Campo")).toHaveValue("12345");
  });

  it("sin formato deja el largo máximo al navegador", () => {
    render(<Campo maxLength={8} />);
    expect(screen.getByLabelText("Campo")).toHaveAttribute("maxlength", "8");
  });

  it("quita el espacio final al salir del campo", async () => {
    render(<Campo formato={mayusculas} />);
    await userEvent.type(screen.getByLabelText("Campo"), "ana ");
    expect(screen.getByLabelText("Campo")).toHaveValue("ANA ");
    await userEvent.tab();
    expect(screen.getByLabelText("Campo")).toHaveValue("ANA");
  });
});
