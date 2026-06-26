import type { NextConfig } from "next";

// Static export — the landing is pre-rendered to plain HTML (full SEO, no server),
// then assembled alongside the static Storybooks and served by Vercel.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
