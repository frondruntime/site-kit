import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { palette } from "../src/lib/palette.ts";

// The build-time colors repeat the stylesheet's tokens by hand, so a token changed in one place
// alone fails here instead of drifting.
const tokens = readFileSync(new URL("../src/styles/design-system.css", import.meta.url), "utf8");

const tokenNames: Record<keyof typeof palette, string> = {
  bg: "--bg",
  bgDim: "--bg-dim",
  panel: "--panel",
  ink: "--ink",
  prose: "--prose",
  muted: "--muted",
  lineBright: "--line-bright",
  accent: "--accent",
  cyan: "--cyan",
  amber: "--amber",
  pink: "--pink",
};

for (const [key, token] of Object.entries(tokenNames)) {
  const value = palette[key as keyof typeof palette];
  const declared = new RegExp(`^\\s*${token}:\\s*([^;]+);`, "m").exec(tokens)?.[1]?.trim();
  test(`palette.${key} matches ${token}`, () => {
    if (declared === undefined) {
      // A palette color with no token is the code theme's own.
      expect(tokens).not.toContain(`${token}:`);
      return;
    }
    expect<string>(value).toBe(declared);
  });
}
