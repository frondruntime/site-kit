/**
 * Resolves callout styling at build time instead of after paint.
 *
 * Two conventions arrive from the corpus, and they need opposite treatment:
 *
 *   > [!NOTE]         GitHub alert syntax. Gets a variant class and a rendered
 *   > body text        label, so it looks the same here as it does on GitHub.
 *
 *   > **A whole       An emphasised lead-in. Ordinary prose that happens to
 *   > sentence.** …    open bold — it is not a label and must not be uppercased.
 *
 * The site previously guessed between them in a `DOMContentLoaded` handler that
 * matched any leading `<strong>` and uppercased it, which meant every lead-in
 * sentence rendered as a letter-spaced heading, one frame after paint. Doing it
 * here removes both the flash and the guess: only `[!TYPE]` is a callout.
 */

import type { Blockquote, Html, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const VARIANTS: Record<string, { readonly klass: string; readonly label: string }> = {
  NOTE: { klass: "callout-note", label: "Note" },
  TIP: { klass: "callout-tip", label: "Tip" },
  IMPORTANT: { klass: "callout-note", label: "Important" },
  WARNING: { klass: "callout-warn", label: "Warning" },
  CAUTION: { klass: "callout-warn", label: "Caution" },
};

export function remarkCallouts() {
  return (tree: Root): void => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const first = node.children[0];
      if (first === undefined || first.type !== "paragraph") return;

      const paragraph = first as Paragraph;
      const lead = paragraph.children[0];
      if (lead === undefined || lead.type !== "text") return;

      const text = lead as Text;
      const match = text.value.match(/^\[!([A-Z]+)\]\s*\n?/);
      if (match === null) return;

      const variant = VARIANTS[match[1] ?? ""];
      if (variant === undefined) return;

      // Drop the marker from the body text, then prepend the rendered label.
      text.value = text.value.slice(match[0].length);
      const label: Html = { type: "html", value: `<strong>${variant.label}</strong>` };
      paragraph.children.unshift(label);

      const data: { hProperties?: Record<string, unknown> } = node.data ?? {};
      node.data = data;
      data.hProperties = { ...data.hProperties, class: variant.klass };
    });
  };
}
