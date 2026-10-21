import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Não gerar AGENTS.md automaticamente.
  agentRules: false,
  // Tailwind v4 é processado pelo loader do Turbopack.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
