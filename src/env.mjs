import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.string().min(1),
    BUCKET_ENDPOINT: z.string().min(1),
    BUCKET_NAME: z.string().min(1),
    BUCKET_REGION: z.string().min(1),
    PRIVATE_BUCKET_NAME: z.string().min(1),
    PRIVATE_BUCKET_REGION: z.string().min(1),
    PRIVATE_BUCKET_ENDPOINT: z.string().min(1),
    PRIVATE_BUCKET_ID: z.string().min(1),
    PRIVATE_BUCKET_PROXY: z.string().min(1),
    aws_access_key_id: z.string().min(1),
    aws_secret_access_key: z.string().min(1),
    CLOUDFARE_API_TOKEN: z.string().min(1),
    CLOUDFARE_ZONE_ID: z.string().min(1),
    CLOUDFARE_ACCOUNT_ID: z.string().min(1),
    CLOUDFARE_KV_NAMESPACE_ID: z.string().min(1)
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BUCKET_ENDPOINT: process.env.BUCKET_ENDPOINT,
    BUCKET_NAME: process.env.BUCKET_NAME,
    BUCKET_REGION: process.env.BUCKET_REGION,
    PRIVATE_BUCKET_NAME: process.env.PRIVATE_BUCKET_NAME,
    PRIVATE_BUCKET_REGION: process.env.PRIVATE_BUCKET_REGION,
    PRIVATE_BUCKET_ENDPOINT: process.env.BUCKET_ENDPOINT,
    PRIVATE_BUCKET_ID: process.env.PRIVATE_BUCKET_ID,
    PRIVATE_BUCKET_PROXY: process.env.PRIVATE_BUCKET_PROXY,
    aws_access_key_id: process.env.aws_access_key_id,
    aws_secret_access_key: process.env.aws_secret_access_key,
    CLOUDFARE_API_TOKEN: process.env.CLOUDFARE_API_TOKEN,
    CLOUDFARE_ZONE_ID: process.env.CLOUDFARE_ZONE_ID,
    CLOUDFARE_ACCOUNT_ID: process.env.CLOUDFARE_ACCOUNT_ID,
    CLOUDFARE_KV_NAMESPACE_ID: process.env.CLOUDFARE_KV_NAMESPACE_ID,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
