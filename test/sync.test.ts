import { afterEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SyncError, type SyncPaths, syncDocs } from "../src/lib/sync.ts";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const write = (root: string, path: string, text: string): void => {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), text);
};

const site = (slugs: ReadonlyArray<string>): { root: string; paths: SyncPaths } => {
  const root = mkdtempSync(join(tmpdir(), "site-kit-"));
  roots.push(root);
  write(
    root,
    "nav.json",
    JSON.stringify({
      groups: [{ label: "A", items: slugs.map((slug) => ({ label: slug, slug })) }],
    }),
  );
  const paths: SyncPaths = {
    corpus: join(root, "docs"),
    content: join(root, "src/content/docs"),
    nav: join(root, "nav.json"),
    samples: join(root, "samples"),
  };
  return { root, paths };
};

test("copies section pages, skips folder meta, and expands regions", () => {
  const { root, paths } = site(["start", "guide/one"]);
  write(root, "docs/README.md", "# meta");
  write(root, "docs/start/index.md", "# Start");
  write(root, "docs/guide/one.md", "<!-- region a.ts#r -->");
  write(root, "samples/a.ts", 'import { x } from "y";\n// #region r\nx();\n// #endregion\n');
  expect(syncDocs(paths)).toEqual({ pages: 2, regions: 1 });
  expect(readFileSync(join(root, "src/content/docs/guide/one.md"), "utf8")).toBe(
    '```ts\nimport { x } from "y";\n\nx();\n```',
  );
});

test("a sidebar slug with no page fails", () => {
  const { root, paths } = site(["start", "missing"]);
  write(root, "docs/start/index.md", "# Start");
  expect(() => syncDocs(paths)).toThrow(SyncError);
});

test("an empty corpus fails", () => {
  const { root, paths } = site([]);
  mkdirSync(join(root, "docs"));
  expect(() => syncDocs(paths)).toThrow("copied 0 pages");
});

test("a marker naming no region fails", () => {
  const { root, paths } = site(["start"]);
  write(root, "docs/start/index.md", "<!-- region a.ts#missing -->");
  write(root, "samples/a.ts", "// #region r\nx();\n// #endregion\n");
  expect(() => syncDocs(paths)).toThrow('has no region "missing"');
});
