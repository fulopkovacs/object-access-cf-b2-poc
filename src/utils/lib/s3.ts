import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

import https from "https";
import { fromIni } from "@aws-sdk/credential-providers";
import { HttpRequest } from "@aws-sdk/protocol-http";
import {
  getSignedUrl,
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@aws-sdk/hash-node";

const createPresignedUrlWithoutClient = async ({ region, bucket, key }) => {
  const url = parseUrl(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
  const presigner = new S3RequestPresigner({
    credentials: fromIni(),
    region,
    sha256: Hash.bind(null, "sha256"),
  });

  const signedUrlObject = await presigner.presign(
    new HttpRequest({ ...url, method: "PUT" })
  );
  return formatUrl(signedUrlObject);
};

const createPresignedUrlWithClient = ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

function put(url, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      { method: "PUT", headers: { "Content-Length": new Blob([data]).size } },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          resolve(responseBody);
        });
      }
    );
    req.on("error", (err) => {
      reject(err);
    });
    req.write(data);
    req.end();
  });
}

export const main = async () => {
  const REGION = env.BUCKET_REGION;
  const BUCKET = env.BUCKET_NAME;
  const KEY = "example_file-pre-signed.txt";

  // There are two ways to generate a presigned URL.
  // 1. Use createPresignedUrl without the S3 client.
  // 2. Use getSignedUrl in conjunction with the S3 client and GetObjectCommand.
  try {
    const noClientUrl = await createPresignedUrlWithoutClient({
      region: REGION,
      bucket: BUCKET,
      key: KEY,
    });

    const clientUrl = await createPresignedUrlWithClient({
      region: REGION,
      bucket: BUCKET,
      key: KEY,
    });

    // After you get the presigned URL, you can provide your own file
    // data. Refer to put() above.
    console.log("Calling PUT using presigned URL without client");
    await put(noClientUrl, "Hello World");

    console.log("Calling PUT using presigned URL with client");
    await put(clientUrl, "Hello World");

    console.log("\nDone. Check your S3 console.");
  } catch (err) {
    console.error(err);
  }
};

function createS3Client() {
  /**
    Create an S3 client
    You must copy the endpoint from your B2 bucket details
    and set the region to match.
  */
  const s3 = new S3Client({
    endpoint: env.BUCKET_ENDPOINT,
    region: env.BUCKET_REGION,
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
}: {
  key: string;
  content: string;
}) {
  const s3 = createS3Client();

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

export async function getPreSignedUrl({
  fileName,
  // contentType,
}: {
  fileName: string;
  // contentType: string;
}): Promise<{
  preSignedUrl: string;
}> {
  const client = createS3Client();

  /* const command = new PutObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: fileName,
  }); */
  const command = new PutObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: fileName,
  });

  const preSignedUrl = await getSignedUrl(client, command, {
    expiresIn: 3600,
    // signableHeaders: new Set("Content-Type"),
  });

  return { preSignedUrl };
}
