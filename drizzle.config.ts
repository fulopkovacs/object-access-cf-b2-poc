import type { Config } from "drizzle-kit";
import { env } from "~/env.mjs";

export default {
  schema: "./src/db/schema.ts",
  driver: "libsql",
  out: "./src/db/migrations",
  dbCredentials: { url: env.DATABASE_URL },
  breakpoints: true,
} satisfies Config;
