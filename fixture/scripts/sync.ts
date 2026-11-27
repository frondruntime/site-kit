/** Copies `docs/` into `src/content/docs`, expanding regions of `samples/`. `bun run sync`. */

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SyncError, syncDocs } from "@frondruntime/site-kit/sync";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

try {
  const { pages, regions } = syncDocs({
    corpus: join(root, "docs"),
    content: join(root, "src/content/docs"),
    nav: join(root, "src/config/nav.json"),
    samples: join(root, "samples"),
  });
  console.log(`[sync] copied ${pages} pages, inlining ${regions} regions`);
} catch (error) {
  if (!(error instanceof SyncError)) throw error;
  console.error(`[sync] ${error.message}`);
  process.exit(1);
}
