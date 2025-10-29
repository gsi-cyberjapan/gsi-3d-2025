import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  /** Core Web Vitals (Next.js デフォルト) */
  ...nextVitals,

  /** typescript-eslint */
  ...tseslint.configs.strict,
  ...tseslint.configs.strictTypeChecked,

  /** Prettier (最後に上書きして競合するルールを無効化) */
  ...prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
