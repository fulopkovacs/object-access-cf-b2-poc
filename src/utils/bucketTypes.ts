import { z } from "zod";

export const bucketTypeSchema = z.union([
  z.literal("PUBLIC"),
  z.literal("PRIVATE"),
]);

export type BucketType = z.infer<typeof bucketTypeSchema>;
