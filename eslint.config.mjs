import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    rules: {
      // The app intentionally reads localStorage inside effects after mount to
      // avoid SSR hydration mismatches; keep this as advisory rather than an error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
