import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    Pin the workspace root to this project.

    A stray package-lock.json sits in the parent folder ("Kevin codes") with no
    package.json beside it. Turbopack's root inference walks up, finds it, and
    warns on every dev start and build that it ignored a lockfile outside the
    repository. Naming the root explicitly ends the guessing.
  */
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
