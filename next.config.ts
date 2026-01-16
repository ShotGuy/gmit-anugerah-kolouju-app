import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to avoid error when Turbopack is enabled by default
  // while we still apply a webpack customization. See Next.js docs.
  turbopack: {},
  // Disable generation of dev source maps via webpack devtool to avoid
  // malformed source map parsing errors in Turbopack / DevTools.
  // This only affects development builds and prevents noisy "Invalid source map" console errors.
  webpack(config, { dev }) {
    if (dev && config) {
      try {
        // turn off devtool so webpack won't emit source maps in dev
        // which avoids DevTools trying to parse malformed maps
        // for server-side chunks.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config.devtool = false;
      } catch (e) {
        // ignore
      }
    }

    return config;
  },
};

export default nextConfig;

