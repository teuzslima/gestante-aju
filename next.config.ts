import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
