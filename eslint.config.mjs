import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Gerado pelo Serwist no build, não é código-fonte.
    "public/sw.js",
    "public/sw.js.map",
    "public/swe-worker-*.js",
    // Projeto nativo Android gerado pelo Capacitor (contém uma cópia do
    // build estático em assets/public, não é código-fonte pra lintar).
    "android/**",
  ]),
]);

export default eslintConfig;
