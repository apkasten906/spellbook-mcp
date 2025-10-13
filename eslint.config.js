// eslint.config.js (root)
import js from "@eslint/js";
import n from "eslint-plugin-n";
import importX from "eslint-plugin-import-x";
import promise from "eslint-plugin-promise";
import unused from "eslint-plugin-unused-imports";
import globals from "globals"; // <-- add this (npm i -D globals)

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.zip",
      "docs/**",
      "prompts/**",
      ".github/**"
    ]
  },
  {
    files: ["mcp-starter/**/*.js", "mcp-starter/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // <-- enables process, console, etc.
      }
    },
    plugins: {
      n,
      "import-x": importX,
      promise,
      "unused-imports": unused
    },
    rules: {
      ...js.configs.recommended.rules,

      // Node/import hygiene
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-missing-import": "off", // Disabled due to workspace structure
      "import-x/no-unresolved": "off", // Disabled due to workspace structure
      "import-x/no-duplicates": "warn",
      "import-x/first": "warn",

      // Optional: order builtins first, then externals, then internals
      "import-x/order": ["warn", {
        "groups": [
          "builtin", "external", "internal", "parent", "sibling", "index", "object", "type"
        ],
        "newlines-between": "always"
      }],

      // Promises & cleanups
      "promise/no-return-wrap": "error",
      "promise/param-names": "warn",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  }
];
