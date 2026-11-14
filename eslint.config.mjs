import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", ".claude/**"],
  },
  {
    rules: {
      // The app intentionally reads localStorage inside effects after mount to
      // avoid SSR hydration mismatches; keep this as advisory rather than an error.
      "react-hooks/set-state-in-effect": "warn",
      // Links go through SiteLink, which holds prefetching until the page has
      // painted instead of fetching every linked route at startup.
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "next/link", message: "Use @/components/SiteLink instead." }] },
      ],
    },
  },
  {
    files: ["src/components/SiteLink.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
];

export default eslintConfig;
