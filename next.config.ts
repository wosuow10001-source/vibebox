import type { NextConfig } from "next";

// Build Content-Security-Policy with optional unsafe-eval only in non-production/dev
const scriptSrcParts = ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com"];
// Enable unsafe-eval only when NODE_ENV is not production or explicit DEV_EVAL=true
if (process.env.NODE_ENV !== 'production' || process.env.DEV_EVAL === 'true') {
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
      `script-src ${scriptSrcParts.join(' ')}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https: https://fonts.gstatic.com",
      "img-src 'self' data: https://cdn.yourdomain.com blob:",
      "frame-src 'self' https://cdn.yourdomain.com",
      "connect-src 'self' https://api.yourdomain.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  productionBrowserSourceMaps: false,
  
  // API 라우트 및 Server Actions 바디 크기 제한 해제
  experimental: {
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
  
  // API 라우트 설정
  serverExternalPackages: [],
  
  // Disable all source maps
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 60000,
      pagesBufferLength: 5,
    },
  }),

  // Disable webpack devtool in dev to avoid source map conflicts
  webpack: (config, { dev, isServer }) => {
    // Completely disable source maps for all environments
    config.devtool = false;
    
    // Disable source map in output
    if (config.output) {
      config.output.sourceMapFilename = undefined;
      config.output.devtoolModuleFilenameTemplate = undefined;
      config.output.devtoolFallbackModuleFilenameTemplate = undefined;
    }
    
    // Remove all source map related plugins
    if (Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter((p: any) => {
        if (!p || !p.constructor) return true;
        const name = p.constructor.name;
        return !name.includes('SourceMap') && !name.includes('Eval');
      });
    }

    // Disable source map in module rules
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
      // Allow uploaded HTML under /uploads to be served without the restrictive CSP
      // so admin-uploaded apps can run inside same-origin iframes.
      {
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Default security headers for all non-admin, non-uploads routes
      {
        source: "/((?!admin|uploads).*)",
        headers: securityHeaders,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  },
};

export default nextConfig;
