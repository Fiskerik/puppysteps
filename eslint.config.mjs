import expoConfig from "eslint-config-expo/flat.js";

export default [
  ...expoConfig,
  {
    ignores: ["android/**", "ios/**", "node_modules/**", ".expo/**", "dist/**"],
  },
];
