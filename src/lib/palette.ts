/**
 * The site's colors for code that cannot read CSS custom properties: the
 * syntax theme, the Mermaid renderer, and the browser's theme color, all of
 * which run at build time.
 *
 * These mirror the tokens in `src/styles/design-system.css`, which stay the
 * source for every stylesheet. Change a color in both places.
 */
export const palette = {
  bg: "#090d12",
  bgDim: "#070b0f",
  panel: "#10161d",
  ink: "#e5eee9",
  prose: "#c8d8d2",
  muted: "#89969a",
  lineBright: "#26313a",
  accent: "#c8f26b",
  cyan: "#3ccfed",
  amber: "#e2a847",
  pink: "#c8b6ff",
} as const;
