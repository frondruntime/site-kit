/**
 * Copies a site's corpus into `src/content/docs/` inside the site, where Astro's content collection
 * can see it, expanding each region marker into the sample it names. A site's sync script calls `syncDocs` and
 * runs before `astro dev`, `astro check`, and `astro build`.
 *
 * Why a copy rather than a pointer: a symlink breaks the dev server. Astro's glob loader computes
 * `posixRelative(base, changed)` against chokidar's real path, so reloads stop firing with no error
 * at all. And the site's tree holds the expanded pages, which no file in the corpus does.
 *
 * The corpus is the only writer. Nothing here edits docs; a page that is wrong is wrong there.
 *
 * Every code example may be a region of a sample file the repository type-checks; `regions.ts`
 * expands each `<!-- region file#name -->` marker into that region, so the site and
 * `llms-full.txt` print code that compiles. A marker that names no region fails the sync.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { SidebarGroup } from "../types.ts";
import { inlineRegions, RegionError } from "./regions.ts";

/** A sync that cannot produce a correct site. */
export class SyncError extends Error {
  override readonly name = "SyncError";
}

function fail(message: string): never {
  throw new SyncError(message);
}

/**
 * A page is exactly `<corpus>/<section>/<name>.md`. Top-level files such as `README.md` are folder
 * meta, not pages, so only section directories are copied.
 */
function isSectionDir(name: string): boolean {
  return !name.startsWith("_") && !name.startsWith(".");
}

/** Absolute paths. */
export interface SyncPaths {
  /** The corpus: one folder per section, each holding `.md` pages. */
  readonly corpus: string;
  /** Where `docsCollection` reads: the site's `src/content/docs`. */
  readonly content: string;
  /** The site's `nav.json`. */
  readonly nav: string;
  /** The folder region markers name files in; without it, a marker fails the sync. */
  readonly samples?: string;
}

export interface SyncResult {
  readonly pages: number;
  readonly regions: number;
}

/** Copies the corpus into the site and checks the sidebar against it. */
export function syncDocs(paths: SyncPaths): SyncResult {
  if (!existsSync(paths.corpus)) {
    fail(`${paths.corpus} is missing — the corpus has no source.`);
  }

  let regions = 0;

  const inlinePage = (page: string): string => {
    try {
      const inlined = inlineRegions(page, readFileSync(page, "utf8"), paths.samples);
      regions += inlined.count;
      return inlined.text;
    } catch (error) {
      if (error instanceof RegionError) fail(error.message);
      throw error;
    }
  };

  const copyTree = (from: string, to: string): number => {
    mkdirSync(to, { recursive: true });
    let pages = 0;
    for (const name of readdirSync(from)) {
      if (name.startsWith(".")) continue;
      const source = join(from, name);
      const target = join(to, name);
      if (statSync(source).isDirectory()) {
        pages += copyTree(source, target);
        continue;
      }
      if (!name.endsWith(".md") && !name.endsWith(".mdx")) continue;
      writeFileSync(target, inlinePage(source));
      pages += 1;
    }
    return pages;
  };

  rmSync(paths.content, { recursive: true, force: true });
  mkdirSync(paths.content, { recursive: true });

  let pages = 0;
  for (const name of readdirSync(paths.corpus)) {
    const section = join(paths.corpus, name);
    if (!isSectionDir(name) || !statSync(section).isDirectory()) continue;
    pages += copyTree(section, join(paths.content, name));
  }

  // A sync that copies nothing is the failure mode worth spending a guard on: every downstream
  // step succeeds and the deploy is a green, empty site.
  if (pages === 0) {
    fail(`copied 0 pages from ${paths.corpus}. Refusing to build an empty site.`);
  }

  // Every sidebar entry must have landed. Deliberately one-directional: the sidebar lists only the
  // pages the site shows, so a copied page absent from it is not an error. Here we only prove the
  // sidebar has no dead links. A slug names `<slug>.md` or, for a section index, `<slug>/index.md`.
  const sidebar = (JSON.parse(readFileSync(paths.nav, "utf8")) as { groups: SidebarGroup[] })
    .groups;
  const missing = sidebar
    .flatMap((group) => group.items.map((item) => item.slug))
    .filter(
      (slug) =>
        !existsSync(join(paths.content, `${slug}.md`)) &&
        !existsSync(join(paths.content, slug, "index.md")),
    );
  if (missing.length > 0) {
    fail(`the sidebar lists ${missing.length} slug(s) with no page: ${missing.join(", ")}`);
  }

  return { pages, regions };
}
