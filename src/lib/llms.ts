/**
 * The agent files a docs site serves: `/llms.txt`, `/llms-full.txt`, and a Markdown copy of each
 * page. Pure functions over the site's docs entries; the site's routes read the collection and pass
 * it in, so this module imports nothing from Astro.
 */

import type { SidebarGroup } from "../types.ts";
import { docsPath, flatSidebarItems } from "./sidebar.ts";

/** The fields of a `docs` collection entry (`docsCollection`) these files read. */
export interface DocEntry {
  readonly id: string;
  readonly filePath?: string | undefined;
  readonly body?: string | undefined;
  readonly data: {
    readonly title: string;
    readonly description?: string | undefined;
    readonly draft?: boolean | undefined;
  };
}

/** What the agent files say about the site. */
export interface LlmsSite {
  readonly name: string;
  /** The deployed origin, without a trailing slash. */
  readonly url: string;
  readonly description: string;
  /** The paragraph under llms.txt's summary line. */
  readonly intro: string;
  /** The line under llms-full.txt's summary line. */
  readonly fullIntro: string;
  readonly sidebar: ReadonlyArray<SidebarGroup>;
}

type LlmsDoc = {
  readonly slug: string;
  readonly markdownPath: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly body: string;
};

export function textResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

// The dev server sends this type; a static build drops it, and the host types the file by its
// extension (`vercel.json` names text/markdown for `.md`).
export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

/**
 * Where a docs page's Markdown copy is served, mirroring the corpus: `effect/boxes.md` at
 * `/docs/effect/boxes.md`, and the section page `start/index.md` at `/docs/start/index.md`, as the
 * llms.txt proposal names a copy of a URL without a file name. The corpus links its pages as
 * relative `.md` paths, so every link in a copy resolves as written.
 */
export function markdownPath(entry: DocEntry): string {
  return entry.filePath?.endsWith("/index.md") === true
    ? `/docs/${entry.id}/index.md`
    : `/docs/${entry.id}.md`;
}

/** Each page's Markdown copy: its title and description, then its source body. */
export function renderMarkdownPages(
  site: LlmsSite,
  entries: ReadonlyArray<DocEntry>,
): ReadonlyArray<{ readonly path: string; readonly body: string }> {
  return orderedDocs(site, entries).map((doc) => ({
    path: doc.markdownPath,
    body: `${[`# ${doc.title}`, "", doc.description ? `> ${doc.description}` : "", "", doc.body]
      .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
      .join("\n")
      .trim()}\n`,
  }));
}

export function renderLlmsIndex(site: LlmsSite, entries: ReadonlyArray<DocEntry>): string {
  const docs = orderedDocs(site, entries);
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  const lines: string[] = [`# ${site.name}`, "", `> ${site.description}`, "", site.intro];

  for (const group of site.sidebar) {
    const groupDocs = group.items.flatMap((item) => bySlug.get(item.slug) ?? []);
    if (groupDocs.length === 0) continue;
    lines.push("", `## ${group.label}`, "");
    for (const doc of groupDocs) {
      lines.push(`- [${doc.title}](${site.url}${doc.markdownPath}): ${doc.description}`);
    }
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Full documentation](${site.url}/llms-full.txt): Every page above, concatenated into one file.`,
  );

  return `${lines.join("\n").trimEnd()}\n`;
}

export function renderLlmsFull(site: LlmsSite, entries: ReadonlyArray<DocEntry>): string {
  const pages = orderedDocs(site, entries).map((doc) =>
    [
      `# ${doc.title}`,
      "",
      `URL: ${doc.url}`,
      doc.description ? `Description: ${doc.description}` : "",
      "",
      doc.body,
    ]
      .filter(Boolean)
      .join("\n")
      .trim(),
  );

  return `${[
    `# ${site.name} Documentation`,
    "",
    `> ${site.description}`,
    "",
    site.fullIntro,
    "",
    ...pages.flatMap((page) => ["---", "", page, ""]),
  ]
    .join("\n")
    .trimEnd()}\n`;
}

/** The published pages, in sidebar order, then the rest by id. */
function orderedDocs(site: LlmsSite, entries: ReadonlyArray<DocEntry>): ReadonlyArray<LlmsDoc> {
  const published = entries.filter((entry) => entry.data.draft !== true);
  const entriesBySlug = new Map(published.map((entry) => [entry.id, entry]));
  const sidebarSlugs = flatSidebarItems(site.sidebar).map((item) => item.slug);
  const sidebarSlugSet = new Set(sidebarSlugs);
  const orderedEntries = [
    ...sidebarSlugs.flatMap((slug) => entriesBySlug.get(slug) ?? []),
    ...published
      .filter((entry) => !sidebarSlugSet.has(entry.id))
      .sort((a, b) => a.id.localeCompare(b.id)),
  ];

  return orderedEntries.map((entry) => ({
    slug: entry.id,
    markdownPath: markdownPath(entry),
    title: entry.data.title,
    description: entry.data.description ?? "",
    url: `${site.url}${docsPath(entry.id)}`,
    body: sourceBody(entry),
  }));
}

function sourceBody(entry: DocEntry): string {
  if (entry.body === undefined) {
    // A page with no body would leave a silently truncated llms-full.txt, the one failure nobody
    // notices, so it is fatal instead.
    throw new Error(`llms: no source body for "${entry.id}". Did the sync run?`);
  }
  return entry.body.trim();
}
