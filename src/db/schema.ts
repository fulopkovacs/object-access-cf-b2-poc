import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
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
