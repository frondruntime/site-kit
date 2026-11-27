import { expect, test } from "bun:test";
import type { Link, Root } from "mdast";
import { VFile } from "vfile";
import { remarkDocsLinks } from "../src/plugins/remarkDocsLinks.ts";

const rewrite = (url: string, page = "react/hooks"): string => {
  const link: Link = { type: "link", url, children: [] };
  const tree: Root = { type: "root", children: [{ type: "paragraph", children: [link] }] };
  const file = new VFile({ path: `/site/src/content/docs/${page}.md` });
  remarkDocsLinks({
    corpusPath: "docs/public",
    repositoryBlob: "https://github.com/owner/name/blob/main",
  })(tree, file);
  return link.url;
};

test("a link to a corpus page becomes its site URL", () => {
  expect(rewrite("../state/boxes.md#reading")).toBe("/docs/state/boxes#reading");
  expect(rewrite("../start/index.md")).toBe("/docs/start");
});

test("a link out of the corpus becomes a blob URL", () => {
  expect(rewrite("../../api.md")).toBe("https://github.com/owner/name/blob/main/docs/api.md");
  expect(rewrite("../../../packages/core/README.md")).toBe(
    "https://github.com/owner/name/blob/main/packages/core/README.md",
  );
});

test("external links and anchors stay", () => {
  expect(rewrite("https://example.dev/a.md")).toBe("https://example.dev/a.md");
  expect(rewrite("#section")).toBe("#section");
});

test("an absolute docs link fails the build", () => {
  expect(() => rewrite("/docs/state/boxes")).toThrow('links "/docs/state/boxes" absolutely');
});
