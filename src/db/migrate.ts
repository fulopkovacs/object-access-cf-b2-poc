import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "~/server/db";

void migrate(db, { migrationsFolder: "./src/db/migrations" });
