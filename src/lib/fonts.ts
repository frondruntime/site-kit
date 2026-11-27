import { fontProviders } from "astro/config";

/**
 * The house font, as an entry of the site's Astro `fonts` config. `BaseLayout` preloads it through
 * its `--font-plex-mono` variable. Downloaded at build time and served from the site's own origin.
 */
export const plexMono = {
  provider: fontProviders.google(),
  name: "IBM Plex Mono",
  cssVariable: "--font-plex-mono",
  weights: [400, 600, 700],
  styles: ["normal"],
  subsets: ["latin"],
  // While the font loads, the system's sans-like monospace, about as wide as Plex Mono. Astro's
  // optimized fallback measures against Courier New, whose slab serifs flash on every load.
  fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
  optimizedFallbacks: false,
};
