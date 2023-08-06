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
