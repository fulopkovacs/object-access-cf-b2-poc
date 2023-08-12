import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { apiInsertClickData, clicksPerPage, images } from "~/db/schema";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  deleteFromKVStore,
  writeToCloudfareKV as writeToCloudfareKVStore,
} from "~/utils/lib/cf";
import { getPreSignedUrl } from "~/utils/lib/s3";

export type ImageDataWithAuthenticatedUrl = {
  authenticatedUrl: string | undefined;
  id: number;
  filename: string;
  public: boolean;
  url: string;
  size: number;
  filetype: string;
  created_at: number;
};

function getKeyInKVStore({ fileName }: { fileName: string }) {
  return `/file/${env.PRIVATE_BUCKET_NAME}/${fileName}`;
}

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
  getAllImages: privateProcedure.query(async ({ ctx }) => {
    // let's pretend it's actually a privateRoute
    const imagesFromDb = await ctx.db.select().from(images).all();
    const authenticatedUrls = await Promise.all(
      imagesFromDb.map((image) =>
        getPreSignedUrl({
          fileName: image.filename,
          bucketName: env.PRIVATE_BUCKET_NAME,
          bucketRegion: env.PRIVATE_BUCKET_REGION,
          bucketEndpoint: env.PRIVATE_BUCKET_ENDPOINT,
          commandType: "GET",
        })
      )
    );

    const imagesWithAuthenticatedUrls: ImageDataWithAuthenticatedUrl[] = [];

    for (let i = 0; i < imagesFromDb.length; i++) {
      const imageFromDb = imagesFromDb[i];
      if (imageFromDb) {
        imagesWithAuthenticatedUrls.push({
          ...imageFromDb,
          authenticatedUrl: authenticatedUrls[i]?.preSignedUrl,
        });
      }
    }

    return imagesWithAuthenticatedUrls;
  }),
  updateObjectAccess: publicProcedure
    .input(
      z.object({
        isPublic: z.boolean(),
        fileName: z.string().min(1),
        imageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const key = getKeyInKVStore({ fileName: input.fileName });
      let operation: string;

      if (input.isPublic) {
        // make it public
        const value = "public";
        await writeToCloudfareKVStore({ key, value });
        operation = "added";
      } else {
        // make it private
        await deleteFromKVStore({ key });
        operation = "deleted";
      }

      await ctx.db
        .update(images)
        .set({ public: input.isPublic })
        .where(eq(images.id, input.imageId))
        .all();

      return { key, operation };
    }),
  generatePreSignedUrl: publicProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        isPublic: z.boolean(),
        fileType: z.string().min(1),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { preSignedUrl } = await getPreSignedUrl({
        fileName: input.fileName,
        bucketName: env.PRIVATE_BUCKET_NAME,
        bucketRegion: env.PRIVATE_BUCKET_REGION,
        bucketEndpoint: env.PRIVATE_BUCKET_ENDPOINT,
        commandType: "PUT",
      });

      const objectUrl = `${env.PRIVATE_BUCKET_PROXY}/file/${
        env.PRIVATE_BUCKET_NAME
      }/${encodeURIComponent(input.fileName)}`;

      if (input.isPublic) {
        // Update CF KV
        await writeToCloudfareKVStore({
          key: getKeyInKVStore({ fileName: input.fileName }),
          value: "public",
        });
      }

      // Record data about the image in the database
      await ctx.db
        .insert(images)
        .values({
          filename: input.fileName,
          public: input.isPublic,
          url: objectUrl,
          filetype: input.fileType,
          size: input.fileSize,
        })
        .onConflictDoUpdate({
          target: images.url,
          set: {
            filename: input.fileName,
            public: input.isPublic,
          },
        })
        .all();

      return { preSignedUrl, objectUrl };
    }),
});
