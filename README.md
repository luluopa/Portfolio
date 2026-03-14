Next.js portfolio with static export.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Edit `app/page.tsx` or page compositions under `app/pages/`.

## Build (static export)

This project is configured for **static export** (`output: 'export'`). Build with:

```bash
npm run build
```

This generates a static site in the `out/` directory. Local development requires Node.js 20.9.0 or newer.

## Deploy

Push to GitHub and import in [Vercel](https://vercel.com/new); the static export is used automatically.
