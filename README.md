# site-kit

The parts the Frond family's sites share, as Astro source: components, layouts, stylesheets, the
Markdown plugins, and small helpers. It is not a site generator. Each site keeps its own Astro
config, routes, content collection config, landing, and corpus, and imports what it uses from here.

Pinna's site (`frondruntime/pinna`, `apps/site`) and Frond's site (`frondruntime/frond-private`,
`apps/site`) use it.

## Install

The package is `private: true` and is never published. A site installs it from this repository,
pinned to a commit:

```json
"@frondruntime/site-kit": "github:frondruntime/site-kit#<commit>"
```

`bun.lock` records the commit. A change here reaches a site when that site moves its pin. The
package ships source, so there is no build step.

## What it holds

| Import | What |
| --- | --- |
| `layouts/BaseLayout.astro` | The document: head metadata, JSON-LD, the font, the background, analytics, page transitions. Takes `site` (`SiteIdentity`). |
| `components/SiteHeader.astro`, `SiteFooter.astro` | The header (brand component, links, current link, drawer toggle) and the footer (mark, credit, repository). |
| `components/DocsShell.astro` | A docs page under the header: sidebar, page, table of contents, pagination, and the drawer, copy, and scrollspy scripts. The footer goes in its `footer` slot. |
| `components/PreviewBanner.astro`, `InlineCode.astro`, `SiteBackground.astro` | The strip above a docs page, text with backticked code, the page background. |
| `components/GoogleAnalytics.astro`, `VercelAnalytics.astro`, `analytics` | Analytics, off unless a production build sets `PUBLIC_ANALYTICS=on`; GA also needs `PUBLIC_GA_ID`. |
| `styles/design-system.css`, `docs.css`, `page.css` | The tokens and shared components, the docs pages, the 404 page. |
| `plugins` | The Markdown pipeline: `docsRemarkPlugins({ corpusPath, repositoryBlob })` and `docsRehypePlugins`, and each plugin alone. |
| `code-theme`, `palette`, `fonts` | The syntax theme, the build-time copy of the token colors, the `plexMono` font entry. |
| `collection` | `docsCollection()`, the `docs` content collection. |
| `sync`, `regions`, `sample-imports` | `syncDocs()` copies a corpus into the site and expands `<!-- region file#name -->` markers into regions of compiled sample files, with their imports. |
| `llms`, `sidebar`, `metadata`, `types` | The llms.txt, llms-full.txt, and Markdown-copy renderers; sidebar helpers; `createJsonLd`; the shapes the rest take. |

`fixture/` is a three-page site built on all of it, and the check builds it. It is also the
shortest example of a site's wiring: `astro.config.mjs`, `src/site.ts`, `src/pages`, and
`scripts/sync.ts`.

## Footer art

The footer's rule takes a tile a site sets: `--footer-art` (an image) and `--footer-art-size`, in a
stylesheet of the site's own. Unset, the rule stands bare.

## Commands

| Command | What |
| --- | --- |
| `bun install` | Installs the kit and the fixture. |
| `bun run check` | Lint, tests, the fixture's build (sync, `astro check`, `astro build`), and the type check of the kit's own `.astro` and `.ts` files. |
| `bun run --cwd fixture dev` | The fixture on a dev server. |

## Design

`design/house-style.md` is the look and the reasons behind it. A site's own brief holds only what is
its own.
