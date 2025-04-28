import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { ignores: ["node_modules/**", "dist/**", "build/**"] },
  {
    extends: [pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
      eslintConfigPrettier],
    // files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      indent: ["error", 4],
      "@typescript-eslint/no-unused-vars": "warn",
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "no-multi-spaces": "error",
      "comma-dangle": ["error", "always-multiline"],
    },
  },
);

