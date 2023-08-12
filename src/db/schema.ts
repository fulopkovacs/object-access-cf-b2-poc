import { sql } from "drizzle-orm";
import { sqliteTable, text, int, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const clicksPerPage = sqliteTable("clicks_per_page", {
  id: int("id").primaryKey({ autoIncrement: true }),
  pathname: text("pathname").unique().notNull(),
  numberOfClicks: int("number_of_clicks"),
});

export const users = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
});

// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users);
export const insertClickDataSchema = createInsertSchema(clicksPerPage);
/* export const insertUserSchema = createInsertSchema(users, {
  id: (s) => s.id,
  firstName: (s) => s.firstName.min(1),
  lastName: (s) => s.lastName.min(1),
  email: (s) => s.email.email(),
}); */

export const apiCreateUserSchema = insertUserSchema.omit({ id: true });
export const apiInsertClickData = insertClickDataSchema.omit({
  id: true,
  numberOfClicks: true,
});

// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(users);
export const selectClickData = createSelectSchema(users);

// Schema for images
export const images = sqliteTable(
  "images",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    filename: text("displayname").notNull(),
    public: int("public", { mode: "boolean" }).default(false).notNull(),
    url: text("url").unique().notNull(),
    size: int("size").notNull(),
    filetype: text("filetype").notNull(),
    authenticated_url: text("authenticated_url").notNull(),
    authenticated_url_expiry_timestamp: int(
      "authenticated_url_created_at"
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
  id: true,
  filename: true,
  created_at: true,
});
