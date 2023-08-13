# [Draft] POC: Control the access to objects stored in Backblaze b2 buckets using Cloudfare Workers, KV and CDN

## Use case

This proof of concept repo covers the following use case:

- you store your users' objects in a Backblaze B2 bucket
- your users users want to be able to make images public/private

## Solution

![diagram](https://github.com/fulopkovacs/virtual-sketchbook/assets/43729152/9cfee125-a2e7-44b3-80ea-2604ef2ea9db)

- In this POC we use a proxy domain (eg.: `static.fyicli.com`) to access the images stored in the private Backblaze b2 bucket.
- All requests to the proxy domain are processed by a Cloudfare worker that tries to get the path to the requested object in the private bucket from a Cloudfare KV Store.
  - if the path is found: the worker modifies the request to include an Authorization token + go to the correct path
  - if the path is not found: it means that the resource is private
- The KV store is updated from the user's dashboard
- Logged-in users can view their images using pre-signed-urls (with an expiry date) from the database (so they're coming from the bucket's s3-compatible API directly, and not from `static.fyicli.com`)
- The Cloudfare Worker needs to periodically be updated with a valid Auth token from Backblaze (max lifespan is 7 days)
  - This could be a CRON job, or another worker that is running periodically => not included in this POC

## Setup

### Codebase

Install the dependencies:

```bash
pnpm i
```

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Push the schema the db:

```bash
pnpm db.local.push
```

Seed the database:

```bash
pnpm db.local.seed
```

### Infrastructure

1. Backblaze b2 bucket
2. Cloudfare KV
3. Cloudfare Workers (Namespace binding: `Cloudfare KV` instance should be bound to `B2_PRIVATE_BUCKET`)

#### Backblaze B2 buckets + CORS

- if you can use `curl`, but get CORS errors (xml: `InvalidSignature`), then there's a high chance that you have CORS-related errors.
  - I solved these by ditching the web UI and updating the bucket's config with the CLI instead:

```bash
b2 update-bucket --corsRules '[
      {
          "corsRuleName": "downloadFromAnyOriginWithUpload",
          "allowedOrigins": [
              "*"
          ],
          "allowedHeaders": [
              "*"
          ],
          "allowedOperations": [
              "b2_download_file_by_id",
              "b2_download_file_by_name",
              "b2_upload_file",
              "b2_upload_part",
              "s3_delete", "s3_get", "s3_head", "s3_post", "s3_put"
          ],
          "exposeHeaders": [        ],

          "maxAgeSeconds": 3600
      }
]' <bucket-name> allPublic
```

## Usage

Start the development server:

```bash
pnpm dev
```

Connect to the local db (requires [`usql`](https://github.com/xo/usql)):

```bash
pnpm db.local
```

### DB

Generate the db migrations:

```bash
pnpm db.local.generate
```

Run db migrations:

```bash
pnpm db.local.migrate
```

# Notes

## Accessing Private Buckets using Cloudflare

> My approach is based on this official guide from Backblaze:
> https://www.backblaze.com/docs/cloud-storage-deliver-private-backblaze-b2-content-through-cloudflare-cdn

### Infrastructure

- private Backblaze b2 bucket
- Cloudflare worker: Authorizes reqeusts to the b2 bucket
- 2nd cloudfare worker: updates the first one periodically
- Cloudflare KV
