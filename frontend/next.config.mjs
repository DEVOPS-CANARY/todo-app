import { dirname } from "path";
import { fileURLToPath } from "url";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emits .next/standalone: a minimal server.js plus only the node_modules it
  // needs. The image copies that folder (platform readiness rule A1).
  output: "standalone",
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url))
};

export default nextConfig;
