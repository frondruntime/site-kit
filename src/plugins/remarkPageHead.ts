/**
 * Drops the head of a corpus page from the rendered site:
 *
 *   > Status: draft      The authoring record. It tells a contributor where the
 *   > Owner skill: …     page stands and says nothing to a reader.
 *
 *   <!-- Owns: … -->     The same record, for the page's scope.
 *
 *   # Page title        DocsLayout prints the page title from frontmatter, so
 *                        keeping this one would put two h1s on the page.
 *
 * The source keeps both, so a page still reads correctly on GitHub. Only the
 * head goes: a later quote or heading is the page's own content.
 */

import type { Root, RootContent } from "mdast";

const isStatusBlock = (node: RootContent): boolean => {
  if (node.type !== "blockquote") return false;
  const paragraph = node.children[0];
  if (paragraph === undefined || paragraph.type !== "paragraph") return false;
  const lead = paragraph.children[0];
  return lead !== undefined && lead.type === "text" && lead.value.startsWith("Status:");
};

const isAuthoringComment = (node: RootContent): boolean =>
  node.type === "html" && node.value.startsWith("<!--");

const isPageTitle = (node: RootContent): boolean => node.type === "heading" && node.depth === 1;

const isPageHead = (node: RootContent): boolean =>
  isStatusBlock(node) || isAuthoringComment(node) || isPageTitle(node);

export function remarkPageHead() {
  return (tree: Root): void => {
    const bodyStart = tree.children.findIndex((node) => !isPageHead(node));
    tree.children = bodyStart === -1 ? [] : tree.children.slice(bodyStart);
  };
}
