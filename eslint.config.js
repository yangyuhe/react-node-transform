const pluginJs = require("@eslint/js");
const pluginTs = require("typescript-eslint");

const config = [
  {
    ...pluginJs.configs.recommended,
    files: ["src/**"],
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  ...pluginTs.configs.recommended.map((i) => ({
    ...i,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
    files: ["**/__test__/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      reacthooks: require("eslint-plugin-react-hooks"),
    },
    rules: {
      "reacthooks/exhaustive-deps": "warn",
    },
  },
];
module.exports = config;
