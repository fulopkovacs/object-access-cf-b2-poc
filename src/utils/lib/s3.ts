import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

export async function uploadFile({
  key,
  content,
}: {
  key: string;
  content: string;
}) {
  // Create an S3 client
  //
  // You must copy the endpoint from your B2 bucket details
  // and set the region to match.
  const s3 = new S3Client({
    endpoint: env.BUCKET_ENDPOINT,
    region: env.BUCKET_REGION,
    credentials: {
      accessKeyId: env.aws_access_key_id,
      secretAccessKey: env.aws_secret_access_key
    }
  });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: key,
        Body: content,
      })
    );

    console.log("Successfully uploaded data to " + env.BUCKET_NAME + "/" + key);
    return "ok";
  } catch (err) {
    console.error("Error: ", err);
    throw err;
  }
}
