import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Shown in Settings, so "which build is this device on" has an answer.
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version },
  // The home folder above this repo has its own package-lock.json; pin the
  // root so Turbopack doesn't treat that as the workspace.
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        // A cached copy of the worker or manifest is a cached copy of the
        // whole build: always revalidate them.
        source: "/:file(sw\\.js|manifest\\.webmanifest)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
