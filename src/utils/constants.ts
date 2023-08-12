/**
  The time until the pre-signed url expires in seconds.
  I think 7 days is the max for Backblaze b2 buckets, but
  I couldn't verify this information through their docs.
*/
export const AUTHENTICATED_URL_EXPIRY = 7 * 24 * 60 * 60; // 1 week
