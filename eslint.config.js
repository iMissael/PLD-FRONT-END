import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default tseslint.config(
  globalIgnores(["dist", "coverage", "node_modules"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Los componentes compartidos exportan también sus variantes (buttonVariants…)
    // y test-utils reexporta Testing Library: la regla de fast refresh no aplica.
    files: ["src/shared/components/**/*.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  // ── Diseño atómico: dependencias solo hacia niveles inferiores ──────────────
  // atoms ← molecules ← organisms ← templates ← features/pages
  ...atomicLayerRules(),
);

function atomicLayerRules() {
  const C = "@/shared/components";
  const legacy = {
    group: [`${C}/ui`, `${C}/ui/*`],
    message: "La capa ui/ fue retirada: importa desde atoms/molecules/organisms/templates.",
  };
  const prohibir = (niveles) =>
    niveles.map((n) => ({
      group: [`${C}/${n}`, `${C}/${n}/*`, `../${n}`, `../${n}/*`],
      message: `Diseño atómico: este nivel no puede depender de ${n}/.`,
    }));
  const capa = (files, superiores) => ({
    files,
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [legacy, ...prohibir(superiores), { group: ["@/features/*", "@/api/*"], message: "Los componentes compartidos no dependen de features ni de la API." }] },
      ],
    },
  });
  return [
    {
      files: ["src/**/*.{ts,tsx}"],
      rules: { "no-restricted-imports": ["error", { patterns: [legacy] }] },
    },
    capa(["src/shared/components/atoms/**"], ["molecules", "organisms", "templates"]),
    capa(["src/shared/components/molecules/**"], ["organisms", "templates"]),
    capa(["src/shared/components/organisms/**"], ["templates"]),
    capa(["src/shared/components/templates/**"], []),
  ];
}
