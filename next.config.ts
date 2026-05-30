<<<<<<< HEAD
import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
=======
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1"],
>>>>>>> 57be3786d78fbdd596b6d3f8b55a2a1f59b838cf
};

export default nextConfig;
