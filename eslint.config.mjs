import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  /** Next.js デフォルト */
  ...nextVitals,

  /** 無視するファイル */
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "*.mjs"]),

  /** typescript-eslint */
  ...tseslint.configs.strict,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  /** Next.jsのルール */
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },

  /** ESLintのデフォルトルール */
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  /** eslint-plugin-react */
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/destructuring-assignment": "error",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/hook-use-state": "error",
      "react/jsx-boolean-value": "error",
      "react/jsx-fragments": "error",
      "react/jsx-curly-brace-presence": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/self-closing-comp": "error",
      "react/jsx-pascal-case": "error",
      "react/no-danger": "error",
    },
  },

  /** eslint-plugin-unused-imports */
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  /** Prettier (最後に上書きして競合するルールを無効化) */
  prettier,
]);

export default eslintConfig;
