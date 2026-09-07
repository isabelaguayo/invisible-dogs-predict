import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/adoptante/resultados": ["./server-data/adoptante/*.f32"],
    "/api/adoptante/photo-search": ["./server-data/adoptante/*.f32"],
  },
};

export default nextConfig;
