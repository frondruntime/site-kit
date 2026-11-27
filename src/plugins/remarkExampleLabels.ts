/**
 * Turns ` ```ts avoid ` / ` ```ts recommended ` fence meta into the labelled
 * header the site already styles.
 *
 * The corpus writes the label as fence meta rather than a raw `<div>` so the
 * markdown stays readable on GitHub and the label cannot drift from the block
 * it labels. Markdown passes the label on as raw HTML, and `rehypeDocsChrome`
 * reads it back with `readExampleLabel` to title the block's header bar.
 */

import type { Code, Html, Parent, Root } from "mdast";
import { visit } from "unist-util-visit";

const LABELS: Record<string, { readonly variant: string; readonly text: string }> = {
  avoid: { variant: "wrong", text: "Avoid" },
  recommended: { variant: "recommended", text: "Recommended" },
};

export interface ExampleLabel {
  readonly variant: string;
  readonly text: string;
}

const labelHtml = (label: ExampleLabel): string =>
  `<div class="code-example-label code-example-label-${label.variant}">${label.text}</div>`;

const labelPattern = /^<div class="code-example-label code-example-label-(\w+)">([^<]+)<\/div>$/;

/** The label `remarkExampleLabels` wrote, read back from its raw HTML. */
export const readExampleLabel = (html: string): ExampleLabel | undefined => {
  const match = labelPattern.exec(html.trim());
  if (match === null) return undefined;
  const [, variant, text] = match;
  return variant === undefined || text === undefined ? undefined : { variant, text };
};

export function remarkExampleLabels() {
  return (tree: Root): void => {
    visit(tree, "code", (node: Code, index: number | undefined, parent: Parent | undefined) => {
      if (parent === undefined || index === undefined) return;

      const meta = node.meta?.trim().split(/\s+/) ?? [];
      const key = meta.find((token) => token in LABELS);
      if (key === undefined) return;

      const label = LABELS[key];
      if (label === undefined) return;

      const html: Html = {
        type: "html",
        value: labelHtml(label),
      };

      parent.children.splice(index, 0, html);
      // Skip the node just inserted so the walk resumes on the code block.
      return index + 2;
    });
  };
}
