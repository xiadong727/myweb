import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 把工作区根目录钉到本项目，避免 Next 因主目录下多余的 package-lock.json 误判根目录
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
