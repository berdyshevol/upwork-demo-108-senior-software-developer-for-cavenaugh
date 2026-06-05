import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app — the parent monorepo also has a
  // lockfile, and without this Next.js may infer the wrong root on Vercel.
  turbopack: { root: __dirname },
};

export default nextConfig;
