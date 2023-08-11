/**
GET AN OBJECT FROM PRIVATE BUCKET USING CLOUDFARE WORKERS.

Based on this script from an official Backblaze guide:
https://github.com/Backblaze/gists/blob/master/b2AuthorizeCfWorker.py
Guide:
https://www.backblaze.com/docs/cloud-storage-deliver-private-backblaze-b2-content-through-cloudflare-cdn
 */

/*
  NOTE: Run this script with the following command:
  ```
  NODE_ENV=development pnpm dotenv -e .env -- tsx src/utils/b2-authorize-cf-worker.ts
  ```
*/

// TODO: run this with a CRON job
// (another worker with CRON Trigger on Cloudfare??)

import { env } from "~/env.mjs";

/** Name of the Cloudfare worker */
const cfWorkerName = "fetch-from-private-b2-bucket";

/**
  Helper function to convert normal string to
  base64-encoded strings in Node.js.
  */
function btoa(text: string): string {
  return Buffer.from(text).toString("base64");
}

async function main() {
  /**
  An authorization token is valid for not more than 1 week
  This sets it to the maximum time value
  */
  const maxSecondsAuthValid = 7 * 24 * 60 * 60; // one week in seconds

  const baseAuthorizationUrl =
    "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
  const b2GetDownloadAuthApi = "/b2api/v2/b2_get_download_authorization";

  /*
    Get fundamental authorization code
    docs:
    https://www.backblaze.com/apidocs/b2-authorize-account
  */
  const idAndKey = env.aws_access_key_id + ":" + env.aws_secret_access_key;
  const b2AuthKeyAndId = btoa(idAndKey);
  const basicAuthString = "Basic" + b2AuthKeyAndId;
  const headers = new Headers();
  headers.append("Authorization", basicAuthString);

  const resp = await fetch(baseAuthorizationUrl, { headers });

  if (!resp.ok) {
    const errorMessage = (await resp.json()) as unknown;
    console.error(errorMessage);
    throw new Error(`[resp] Failed with ${resp.status}`);
  }

  const respData = (await resp.json()) as {
    authorizationToken: string;
    downloadUrl: string;
    recommendedPartSize: string;
    apiUrl: string;
  };

  const {
    authorizationToken: bAuToken,
    downloadUrl: b4FileDownloadUrl,
    recommendedPartSize: bPartSize,
    apiUrl: bApiUrl,
  } = respData;

  /*
    Get specific download authorization
    docs:
    https://www.backblaze.com/apidocs/b2-get-download-authorization
  */
  const getDownloadAuthorizationUrl = bApiUrl + b2GetDownloadAuthApi;
  const downloadAuthorizationHeaders = new Headers();
  downloadAuthorizationHeaders.append("Authorization", bAuToken);

  const resp2 = await fetch(getDownloadAuthorizationUrl, {
    method: "POST",
    headers: downloadAuthorizationHeaders,
    body: JSON.stringify({
      bucketId: env.PRIVATE_BUCKET_ID,
      fileNamePrefix: "",
      validDurationInSeconds: maxSecondsAuthValid,
    }),
  });

  if (!resp2.ok) {
    const errorMessage = (await resp2.json()) as unknown;
    console.error(errorMessage);
    throw new Error(`[resp2] Failed with ${resp.status}`);
  }

  const { authorizationToken: bDownAuToken } = (await resp2.json()) as {
    authorizationToken: string;
  };

  // Replace the worker's source code
  const workerCode = `
    addEventListener('fetch', event => {
      event.respondWith(handleRequest(event.request))
    })

    async function handleRequest(request) {
      let authToken='${bDownAuToken}'
      let b2Headers = new Headers(request.headers)
      b2Headers.append("Authorization", authToken)
      const modRequest = new Request(request.url, {
          method: request.method,
          headers: b2Headers
      })
      const response = await fetch(modRequest)
      return response
    }`;

  const cfHeaders = new Headers();
  cfHeaders.append("Authorization", "Bearer " + env.CLOUDFARE_API_TOKEN);
  cfHeaders.append("Content-Type", "application/javascript");

  const cfUrl =
    "https://api.cloudflare.com/client/v4/accounts/" +
    env.CLOUDFARE_ACCOUNT_ID +
    "/workers/scripts/" +
    cfWorkerName;

  const resp3 = await fetch(cfUrl, {
    method: "PUT",
    headers: cfHeaders,
    body: workerCode,
  });

  if (!resp3.ok) {
    const errorMessage = (await resp3.json()) as unknown;
    console.error(errorMessage);
    throw new Error(`[resp3] Failed with ${resp3.status}`);
  }

  const r3 = (await resp3.json()) as unknown;
  console.log(r3);
}

main().catch(console.error);
