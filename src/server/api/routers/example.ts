import { sql } from "drizzle-orm";
import { z } from "zod";
import { apiInsertClickData, clicksPerPage } from "~/db/schema";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPreSignedUrl } from "~/utils/lib/s3";

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
  generatePreSignedUrl: publicProcedure
    .input(
      z.object({ fileName: z.string().min(1), contentType: z.string().min(1) })
    )
    .mutation(async ({ ctx, input }) => {
      // console.log(input);
      // return { preSignedUrl: "ok" };
      const { preSignedUrl } = await getPreSignedUrl({
        // fileName: input.fileName,
        // contentType: input.contentType,
        fileName: "hello-2.txt",
      });

      return { preSignedUrl };
    }),
});
