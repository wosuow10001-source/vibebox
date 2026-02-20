import type { NextConfig } from "next";

// Build Content-Security-Policy with optional unsafe-eval only in non-production/dev
const scriptSrcParts = [
  "'self'",
  "'unsafe-inline'",
  "https://pagead2.googlesyndication.com",
];

// Enable unsafe-eval only when NODE_ENV is not production or explicit DEV_EVAL=true
if (process.env.NODE_ENV !== "production" || process.env.DEV_EVAL === "true") {
  scriptSrcParts.unshift("'unsafe-eval'");
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrcParts.join(" ")}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https: https://fonts.gstatic.com",
      "img-src 'self' data: https://cdn.yourdomain.com blob:",
      "frame-src 'self' https://cdn.yourdomain.com",
      "connect-src 'self' https://api.yourdomain.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ✅ 빌드 시 타입 에러 / ESLint 에러 무시
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  productionBrowserSourceMaps: false,

  experimental: {
    serverActions: {
      bodySizeLimit: "2gb",
    },
  },

  serverExternalPackages: [],

  ...(process.env.NODE_ENV === "development" && {
    onDemandEntries: {
      maxInactiveAge: 60000,
      pagesBufferLength: 5,
    },
  }),

  webpack: (config, { dev, isServer }) => {
    // Completely disable source maps
    config.devtool = false;

    if (config.output) {
      config.output.sourceMapFilename = undefined;
      config.output.devtoolModuleFilenameTemplate = undefined;
      config.output.devtoolFallbackModuleFilenameTemplate = undefined;
    }

    if (Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter((p: any) => {
        if (!p || !p.constructor) return true;
        const name = p.constructor.name;
        return !name.includes("SourceMap") && !name.includes("Eval");
      });
    }

    if (Array.isArray(config.module?.rules)) {
      config.module.rules.forEach((rule: any) => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach((loader: any) => {
            if (loader.options) {
              loader.options.sourceMap = false;
            }
          });
        }
      });
    }

    return config;
  },

  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/((?!admin|uploads).*)",
        headers: securityHeaders,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  },
};

export default nextConfig;
