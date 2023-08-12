import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { apiInsertClickData, clicksPerPage, images } from "~/db/schema";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { AUTHENTICATED_URL_EXPIRY } from "~/utils/constants";
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

function getKeyInKVStore({ key }: { key: string }) {
  return `/file/${env.PRIVATE_BUCKET_NAME}/${key}`;
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
  getAllImages:
    // Let's pretend it's actually a private procedure
    privateProcedure.query(async ({ ctx }) => {
      const imagesFromDb = await ctx.db.select().from(images).all();

      // We take away 5 mins just to be safe
      const currentTimestamp = Date.now() - 5 * 60 * 1000;
      const expiryTimestamp = Date.now() + AUTHENTICATED_URL_EXPIRY * 1000;

      const imagesWithExpiredAuthenticatedUrls = imagesFromDb.filter((d) => {
        d.authenticated_url_expiry_timestamp > currentTimestamp;
      });

      const newAuthenticatedUrls = await Promise.all(
        imagesWithExpiredAuthenticatedUrls.map((image) =>
          getPreSignedUrl({
            key: image.filename,
            bucketName: env.PRIVATE_BUCKET_NAME,
            bucketRegion: env.PRIVATE_BUCKET_REGION,
            bucketEndpoint: env.PRIVATE_BUCKET_ENDPOINT,
            commandType: "GET",
          })
        )
      );

      const idsToNewAuthenticatedUrls =
        imagesWithExpiredAuthenticatedUrls.reduce<
          Map<number, string | undefined>
        >(
          (map, c, i) => map.set(c.id, newAuthenticatedUrls[i]?.preSignedUrl),
          new Map()
        );

      await Promise.all(
        imagesWithExpiredAuthenticatedUrls.map((imageData) =>
          ctx.db.update(images).set({
            authenticated_url: idsToNewAuthenticatedUrls.get(imageData.id),
            authenticated_url_expiry_timestamp: expiryTimestamp,
          })
        )
      );

      const imagesWithAuthenticatedUrls: ImageDataWithAuthenticatedUrl[] = [];

      for (const imageFromDb of imagesFromDb) {
        if (imageFromDb) {
          imagesWithAuthenticatedUrls.push({
            ...imageFromDb,
            authenticatedUrl:
              idsToNewAuthenticatedUrls.get(imageFromDb.id) ??
              imageFromDb.authenticated_url,
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
      const key = getKeyInKVStore({ key: input.fileName });
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
        key: input.fileName,
        bucketName: env.PRIVATE_BUCKET_NAME,
        bucketRegion: env.PRIVATE_BUCKET_REGION,
        bucketEndpoint: env.PRIVATE_BUCKET_ENDPOINT,
        commandType: "PUT",
      });

      const { preSignedUrl: authenticatedUrl } = await getPreSignedUrl({
        key: input.fileName,
        bucketName: env.PRIVATE_BUCKET_NAME,
        bucketRegion: env.PRIVATE_BUCKET_REGION,
        bucketEndpoint: env.PRIVATE_BUCKET_ENDPOINT,
        commandType: "GET",
      });

      const objectUrl = `${env.PRIVATE_BUCKET_PROXY}/file/${
        env.PRIVATE_BUCKET_NAME
      }/${encodeURIComponent(input.fileName)}`;

      if (input.isPublic) {
        // Update CF KV
        await writeToCloudfareKVStore({
          key: getKeyInKVStore({ key: input.fileName }),
          value: "public",
        });
      }

      const authenticated_url_expiry_timestamp =
        Date.now() + AUTHENTICATED_URL_EXPIRY * 1000;

      // Record data about the image in the database
      await ctx.db
        .insert(images)
        .values({
          filename: input.fileName,
          public: input.isPublic,
          url: objectUrl,
          filetype: input.fileType,
          size: input.fileSize,
          authenticated_url: authenticatedUrl,
          authenticated_url_expiry_timestamp,
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
