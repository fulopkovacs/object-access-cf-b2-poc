import { db } from "~/server/db";
import {
  type apiCreateUserSchema,
  users,
  type apiInsertClickData,
  clicksPerPage,
} from "./schema";
import { type z } from "zod";

async function seed() {
  const testUser: z.infer<typeof apiCreateUserSchema> = {
    firstName: "Joe",
    lastName: "Doe",
    email: "joe@doe.com",
  };

  await db
    .insert(users)
    .values(testUser)
    .returning({ insertedId: users.id })
    .all();

  const basePathClickData: z.infer<typeof apiInsertClickData> = {
    pathname: "/",
  };

  await db
    .insert(clicksPerPage)
    .values(basePathClickData)
    .returning({ insertedId: clicksPerPage.id })
    .all();
}

void seed();
