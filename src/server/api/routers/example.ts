import { sql } from "drizzle-orm";
import { z } from "zod";
import { apiInsertClickData, clicksPerPage, images } from "~/db/schema";
import { env } from "~/env.mjs";
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
      z.object({
        fileName: z.string().min(1),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { preSignedUrl } = await getPreSignedUrl({
        fileName: input.fileName,
        bucketName: env.PRIVATE_BUCKET_NAME,
        bucketRegion: env.PRIVATE_BUCKET_REGION,
        bucketEndpoint: env.PRIVATE_BUCKET_ENDPOINT,
      });

      const objectUrl = `${env.PRIVATE_BUCKET_PROXY}/file/${
        env.PRIVATE_BUCKET_NAME
      }/${encodeURIComponent(input.fileName)}`;

      // Record data about the image in the database
      await ctx.db
        .insert(images)
        .values({
          filename: input.fileName,
          public: input.isPublic ? 1 : 0,
          url: objectUrl,
        })
        .onConflictDoUpdate({
          target: images.url,
          set: {
            filename: input.fileName,
            public: input.isPublic ? 1 : 0,
          },
        })
        .all();

      return { preSignedUrl, objectUrl };
    }),
});
