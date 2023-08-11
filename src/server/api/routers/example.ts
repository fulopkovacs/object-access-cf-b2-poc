import { sql } from "drizzle-orm";
import { z } from "zod";
import { apiInsertClickData, clicksPerPage } from "~/db/schema";
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
        usePrivateBucket: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // console.log(input);
      // return { preSignedUrl: "ok" };
      const [bucketName, bucketRegion, bucketEndpoint] = input.usePrivateBucket
        ? [
            env.PRIVATE_BUCKET_NAME,
            env.PRIVATE_BUCKET_REGION,
            env.PRIVATE_BUCKET_ENDPOINT,
          ]
        : [env.BUCKET_NAME, env.BUCKET_REGION, env.BUCKET_ENDPOINT];

      const { preSignedUrl } = await getPreSignedUrl({
        fileName: input.fileName,
        bucketName,
        bucketRegion,
        bucketEndpoint,
        // contentType: input.contentType,
        // fileName: "hello-2.txt",
      });
      const objectUrl = input.usePrivateBucket
        ? `${env.PRIVATE_BUCKET_PROXY}/file/${
            env.PRIVATE_BUCKET_NAME
          }/${encodeURIComponent(input.fileName)}`
        : `https://${bucketName}.s3.${bucketRegion}.backblazeb2.com/${encodeURIComponent(
            input.fileName
          )}`;

      return { preSignedUrl, objectUrl };
    }),
});
