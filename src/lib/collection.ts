import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * The `docs` collection a site's `src/content.config.ts` names:
 *
 *     export const collections = { docs: docsCollection() };
 *
 * Content is copied from the corpus by `site-kit sync`; nothing else writes it. `.md` only: a
 * corpus with no `.mdx` would only let one through quietly.
 */
export const docsCollection = () =>
  defineCollection({
    // The id is the file path as written, so `migration/from-0.5.md` serves at
    // `/docs/migration/from-0.5` and `start/index.md` at `/docs/start`, which
    // is what `remarkDocsLinks` produces. The default id would slugify the dot.
    loader: glob({
      pattern: "**/*.md",
      base: "./src/content/docs",
      generateId: ({ entry }) => entry.replace(/\.md$/, "").replace(/(^|\/)index$/, ""),
    }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      draft: z.boolean().optional(),
      /** When a human last read the page against the source. Display-only. */
      reviewed: z.string().optional(),
    }),
  });
