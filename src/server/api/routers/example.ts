import { sql } from "drizzle-orm";
import { z } from "zod";
import { apiInsertClickData, clicksPerPage } from "~/db/schema";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { uploadFile } from "~/utils/lib/s3";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAllClicks: publicProcedure.query(async ({ ctx }) => {
    const allClicks = await ctx.db.select().from(clicksPerPage).all();
    return allClicks;
  }),
  insertClick: publicProcedure
    .input(apiInsertClickData)
    .mutation(async ({ ctx, input }) => {
      const [res] = await ctx.db
        .insert(clicksPerPage)
        .values({ ...input, numberOfClicks: 1 })
        // .onConflictDoNothing()
        .onConflictDoUpdate({
          target: clicksPerPage.pathname,
          set: { numberOfClicks: sql`${clicksPerPage.numberOfClicks} + 1` },
        })
        .returning({ insertedId: clicksPerPage.id })
        .all();

      return { insertedId: res?.insertedId };
    }),
  uploadTestFile: publicProcedure.mutation(async ({ ctx }) => {
    await uploadFile({
      key: Date.now().toString(),
      content: Date.now().toString(),
    });

    return { message: "success" };
  }),
});
