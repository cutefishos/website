# Website

The source of [cutefish.org](https://cutefish.org), built with
[Astro](https://astro.build) into a static site.

Pages live in `src/pages/[...lang]/`, interface text in `src/i18n/<locale>.json`
and blog posts in `src/content/blog/<locale>/`. English is served at the site
root; another locale is added to `src/i18n/index.ts` and served under its code.

## Dependencies

Bun 1.4 or later.

```sh
bun install --frozen-lockfile
```

## Build

```sh
bun run dev      # local server with live reload
bun run build    # static site in dist/
bun run preview  # serve dist/
```

## Deploy

Every push to `main` is built and published to GitHub Pages by
`.github/workflows/deploy.yml`, served at cutefish.org through `public/CNAME`.
