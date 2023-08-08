# Virtual Sketchbook

Easy image organisation + sharing for artists.

## Setup

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

## Backblaze B2 buckets + CORS

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
