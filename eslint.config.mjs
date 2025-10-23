import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import perfectionistPlugin from "eslint-plugin-perfectionist";
//import globals from "globals";

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/ui/**", // 元の構成の除外フォルダ
  ]),

  // グローバル変数 (ブラウザ環境)
  // {
  //   languageOptions: {
  //     globals: globals.browser,
  //   },
  // },

  // eslint-plugin-react 共通ルール
  {
    plugins: { react: reactPlugin },
    settings: { react: { version: "detect" } },
    rules: {
      "react/destructuring-assignment": "error",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-boolean-value": "error",
      "react/jsx-fragments": "error",
      "react/jsx-curly-brace-presence": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-sort-props": "error",
      "react/self-closing-comp": "error",
      "react/jsx-pascal-case": "error",
      "react/no-danger": "error",
      "react/prop-types": "off",
    },
  },

  // eslint-plugin-react-hooks
  {
    rules: {
      "react-hooks/exhaustive-deps": "error",
    },
  },

  // 未使用 import / var チェック
  {
    plugins: { "unused-imports": unusedImportsPlugin },
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

  // perfectionist で interface / object プロパティをソート
  {
    plugins: { perfectionist: perfectionistPlugin },
    rules: {
      "perfectionist/sort-interfaces": "warn",
      "perfectionist/sort-object-types": "warn",
    },
  },
]);

export default eslintConfig;
