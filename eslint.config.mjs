import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The React-Compiler *advisory* rules bundled with Next 16 are downgraded
      // to warnings. They flag legitimate, correct patterns this project relies
      // on: hydrating state from browser-only localStorage on mount, an
      // imperative countdown timer that setStates inside setInterval, and a
      // seeded RNG for the deterministic quiz engine. rules-of-hooks and
      // exhaustive-deps stay as errors — those catch real bugs.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
