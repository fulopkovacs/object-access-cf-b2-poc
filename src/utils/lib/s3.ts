import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { AUTHENTICATED_URL_EXPIRY } from "../constants";

function createS3Client({
  bucketEndpoint,
  bucketRegion,
}: {
  bucketEndpoint: string;
  bucketRegion: string;
}) {
  /**
    Create an S3 client
    You must copy the endpoint from your B2 bucket details
    and set the region to match.
  */
  const s3 = new S3Client({
    endpoint: bucketEndpoint,
    region: bucketRegion,
    credentials: {
      accessKeyId: env.aws_access_key_id,
      secretAccessKey: env.aws_secret_access_key,
    },
  });

  return s3;
}

export async function uploadFile({
  key,
  content,
  bucketRegion,
  bucketEndpoint,
  bucketName,
}: {
  key: string;
  content: string;
  bucketName: string;
  bucketRegion: string;
  bucketEndpoint: string;
}) {
  const s3 = createS3Client({ bucketEndpoint, bucketRegion });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
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

export async function getPreSignedUrl({
  key,
  bucketName,
  bucketRegion,
  bucketEndpoint,
  commandType,
}: {
  key: string;
  bucketName: string;
  bucketRegion: string;
  bucketEndpoint: string;
  commandType: "PUT" | "GET";
}): Promise<{
  preSignedUrl: string;
}> {
  const s3 = createS3Client({ bucketEndpoint, bucketRegion });

  const expiresIn = commandType === "GET" ? AUTHENTICATED_URL_EXPIRY : 3600;

  const command =
    commandType === "GET"
      ? new GetObjectCommand({ Bucket: bucketName, Key: key })
      : new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
        });

  const preSignedUrl = await getSignedUrl(s3, command, {
    expiresIn,
  });

  return { preSignedUrl };
}
