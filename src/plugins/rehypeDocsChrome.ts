/**
 * Adds reading chrome to rendered docs at build time:
 *
 *   - h2 and h3 get a trailing `#` link to themselves, so a section can be
 *     linked without a trip through the TOC.
 *   - every `<pre>` is wrapped in `.code-frame` under a header bar, the same
 *     bar the landing page's code panels wear. The bar names the block (its
 *     "Avoid" or "Recommended" label, else its language) and holds the copy
 *     button, outside the scrolling `<pre>`. DocsLayout handles the click.
 *   - every `<table>` is wrapped in `.table-frame`, which scrolls sideways on
 *     narrow screens instead of widening the page. The table itself keeps its
 *     table display, so its semantics reach assistive tech intact.
 *
 * Astro assigns heading ids after user rehype plugins, so the config runs
 * `rehypeHeadingIds` ahead of this one. The anchor carries no text node, which
 * keeps it out of the heading text Astro collects for the TOC.
 */

import { type ExampleLabel, readExampleLabel } from "./remarkExampleLabels.ts";

interface HastRaw {
  readonly type: "raw";
  readonly value: string;
}

interface HastText {
  readonly type: "text";
  readonly value: string;
}

interface HastElement {
  readonly type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
}

type HastNode = HastElement | HastText | { readonly type: string; children?: HastNode[] };

interface HastRoot {
  readonly type: "root";
  children: HastNode[];
}

const anchoredHeadings = new Set(["h2", "h3"]);

const isElement = (node: HastNode): node is HastElement => node.type === "element";

const textOf = (node: HastNode): string => {
  if (node.type === "text") return (node as HastText).value;
  return "children" in node && node.children !== undefined
    ? node.children.map(textOf).join("")
    : "";
};

const headingAnchor = (heading: HastElement): HastElement | undefined => {
  const id = heading.properties.id;
  if (typeof id !== "string") return undefined;
  return {
    type: "element",
    tagName: "a",
    properties: {
      className: ["heading-anchor"],
      href: `#${id}`,
      ariaLabel: `Link to section: ${textOf(heading).trim()}`,
    },
    children: [],
  };
};

const languageNames: Record<string, string> = {
  plaintext: "Text",
  text: "Text",
  sh: "Shell",
  bash: "Shell",
};

const text = (value: string): HastText => ({ type: "text", value });

const codeFrame = (pre: HastElement, label: ExampleLabel | undefined): HastElement => {
  const language =
    typeof pre.properties.dataLanguage === "string" ? pre.properties.dataLanguage : "text";
  const title = label?.text ?? languageNames[language] ?? language;
  const variant = label === undefined ? [] : [`code-frame-${label.variant}`];
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["code-frame", ...variant] },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: { className: ["code-bar", "code-header"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["code-header-title"] },
            children: [text(title)],
          },
          {
            type: "element",
            tagName: "button",
            properties: { type: "button", className: ["code-copy"], ariaLabel: "Copy code" },
            children: [text("Copy")],
          },
        ],
      },
      pre,
    ],
  };
};

const tableFrame = (table: HastElement): HastElement => ({
  type: "element",
  tagName: "div",
  properties: { className: ["table-frame"] },
  children: [table],
});

const isBlank = (node: HastNode): boolean =>
  node.type === "text" && (node as HastText).value.trim() === "";

/** The example label just before a block, which the block's header takes over. */
const labelBefore = (output: HastNode[]): ExampleLabel | undefined => {
  let index = output.length - 1;
  while (index >= 0 && isBlank(output[index] as HastNode)) index -= 1;
  const node = output[index];
  if (node?.type !== "raw") return undefined;
  const label = readExampleLabel((node as HastRaw).value);
  if (label !== undefined) output.splice(index);
  return label;
};

const decorate = (parent: HastRoot | HastElement): void => {
  const output: HastNode[] = [];
  for (const child of parent.children) {
    output.push(decorateNode(child, output));
  }
  parent.children = output;
};

const decorateNode = (child: HastNode, output: HastNode[]): HastNode => {
  if (!isElement(child)) return child;
  if (child.tagName === "pre") return codeFrame(child, labelBefore(output));
  if (child.tagName === "table") return tableFrame(child);
  if (anchoredHeadings.has(child.tagName)) {
    const anchor = headingAnchor(child);
    if (anchor !== undefined) child.children.push(anchor);
    return child;
  }
  decorate(child);
  return child;
};

export function rehypeDocsChrome() {
  return (tree: HastRoot): void => {
    decorate(tree);
  };
}
