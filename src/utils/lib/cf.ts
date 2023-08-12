/**
  Utilities related to Cloudfare API-s.
*/

import { env } from "~/env.mjs";

export async function writeToCloudfareKV({
  key,
  value,
}: {
  key: string;
  value: string;
}) {
  const headers = new Headers();
  headers.append("Authorization", "Bearer " + env.CLOUDFARE_API_TOKEN);
  // headers.append("Content-Type", "multipart/form-data");

  const url = `https://api.cloudflare.com/client/v4/accounts/${
    env.CLOUDFARE_ACCOUNT_ID
  }/storage/kv/namespaces/${
    env.CLOUDFARE_KV_NAMESPACE_ID
  }/values/${encodeURIComponent(key)}`;

  const formData = new FormData();
  formData.append("value", value);
  formData.append("metadata", JSON.stringify(null));

  const resp = await fetch(url, {
    headers,
    method: "PUT",
    body: formData,
  });

  if (!resp.ok) {
    const respJson = (await resp.json()) as unknown;
    console.log(respJson);
    console.error(
      `[writeToCloudfareKV] Failed with status code ${resp.status}`
    );
    throw new Error(`Failed to update key "${key}" with value "${value}"!`);
  }

  return { success: true };
}
