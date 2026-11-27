/**
 * Renders ` ```mermaid ` fences to inline SVG at build time.
 *
 * Mermaid is what replaced the bespoke dependency-graph island: the same
 * information, rendered natively by GitHub, available to every page instead of
 * one. Rendering here rather than in the browser means no runtime dependency
 * and no flash of unrendered source.
 */

import { renderMermaidSVG } from "beautiful-mermaid";
import type { Code, Html, Parent, Root } from "mdast";
import { visit } from "unist-util-visit";
import { palette } from "../lib/palette.ts";

/** Matches the palette the rest of the site is drawn in. */
const THEME = {
  bg: palette.bg,
  fg: palette.ink,
  line: palette.lineBright,
  accent: palette.accent,
  muted: palette.muted,
  surface: palette.panel,
  border: palette.lineBright,
  font: "IBM Plex Mono",
  transparent: true,
} as const;

/**
 * Sequence diagrams come back with lifelines running to the bottom of the
 * viewBox, well past the last message. Trim them.
 *
 * The predecessor of this function took `Math.max()` over the message list
 * unconditionally, which is `-Infinity` when there are no messages — so every
 * `graph` and `flowchart` got `viewBox="0 0 W -Infinity"` and rendered as
 * nothing. Hence the guard: no messages, no trimming.
 */
function trimLifelines(svg: string): string {
  const messageYs = [...svg.matchAll(/class="message"[\s\S]*?<line[^>]+y1="([\d.]+)"/g)]
    .map((match) => Number.parseFloat(match[1] ?? ""))
    .filter((y) => Number.isFinite(y));

  if (messageYs.length === 0) return svg;

  const end = Math.max(...messageYs) + 30;
  return svg
    .replace(/(<line\s+class="lifeline"[^>]*?)y2="[\d.]+"/g, `$1y2="${end}"`)
    .replace(
      /viewBox="[\d.]+ [\d.]+ ([\d.]+) [\d.]+"/,
      (_, width) => `viewBox="0 0 ${width} ${end + 10}"`,
    );
}

function render(diagram: string): string {
  const svg = trimLifelines(renderMermaidSVG(diagram, THEME))
    // The site self-hosts its font under a hashed family name; drop the
    // renderer's Google Fonts import and inherit the page's stack instead.
    .replace(/\s*@import url\([^)]*\);/g, "")
    .replace(/font-family:\s*'IBM Plex Mono'[^;]*;/g, "font-family: var(--font-mono);")
    // Sharp corners, to match the rest of the site's chrome.
    .replace(/\s+rx="[^"]*"/g, ' rx="0"')
    .replace(/\s+ry="[^"]*"/g, ' ry="0"')
    // viewBox plus CSS drives scaling; explicit dimensions fight it.
    .replace(/\s+width="[^"]*"/, "")
    .replace(/\s+height="[^"]*"/, "");

  return `<figure class="mermaid-diagram">${svg}</figure>`;
}

export function remarkMermaid() {
  return (tree: Root): void => {
    visit(tree, "code", (node: Code, index: number | undefined, parent: Parent | undefined) => {
      if (parent === undefined || index === undefined || node.lang !== "mermaid") return;

      const html: Html = { type: "html", value: render(node.value) };
      parent.children.splice(index, 1, html);
    });
  };
}
