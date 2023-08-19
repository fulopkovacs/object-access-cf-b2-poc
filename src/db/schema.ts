import { sql } from "drizzle-orm";
import { sqliteTable, text, int, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

// Schema for images
export const images = sqliteTable(
  "images",
  {
    // id: int("id").primaryKey({ autoIncrement: true }),
    id: text("id").primaryKey(),
    filename: text("displayname").notNull(),
    public: int("public", { mode: "boolean" }).default(false).notNull(),
    url: text("url").unique().notNull(),
    size: int("size").notNull(),
    filetype: text("filetype").notNull(),
    authenticated_url: text("authenticated_url").notNull(),
    authenticated_url_expiry_timestamp: int(
      "authenticated_url_expiry_timestamp"
    ).notNull(),
    created_at: int("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      // Create an index for the url
      url_idx: index("url_idx").on(table.url),
    };
  }
);

export const insertImageSchema = createInsertSchema(images);
export const apiCreateImageSchema = insertImageSchema.omit({
  filename: true,
  created_at: true,
});
