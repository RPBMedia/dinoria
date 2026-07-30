import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile in the home dir otherwise confuses
  // Next's root inference).
  turbopack: { root: path.resolve(__dirname) },
  images: {
    // Dinosaur artwork is self-hosted under /public; no remote domains needed.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
