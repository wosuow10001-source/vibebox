// lib/prisma.ts
// Load @prisma/client at runtime inside a try/catch to avoid crashing
// when Prisma client isn't generated or DATABASE_URL is not set.
let prisma: any;
try {
  // Use require to keep import from throwing at module evaluation time
  // if @prisma/client is not installed or generated.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("@prisma/client");
  const { PrismaClient } = pkg;

  const globalForPrisma = global as unknown as { prisma?: any };

  prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch (err) {
  // If Prisma can't be loaded, export a proxy that throws when used.
  // This prevents module-load time crashes and gives clearer runtime errors.
  // eslint-disable-next-line no-console
  console.warn("@prisma/client not available, falling back to proxy:", err?.message ?? err);

  const thrower = () => {
    throw new Error("Prisma client is not available in this environment.");
  };

  const handler: ProxyHandler<any> = {
    get() {
      return thrower;
    },
    apply() {
      return thrower();
    },
  };

  prisma = new Proxy(() => {}, handler);
}

export { prisma };
