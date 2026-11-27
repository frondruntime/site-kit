/**
 * The Markdown pipeline a docs site runs, in the order it must run. The corpus is authored to read
 * correctly on GitHub and in a clone; these turn that source into the site: the page head out of
 * the body, repo-relative links into URLs, fence meta into labelled examples, mermaid fences into
 * SVG, and GitHub alert syntax into callouts. Heading ids come before `rehypeDocsChrome`, which
 * links each heading to its id. A site passes both lists to `unified()` from
 * `@astrojs/markdown-remark` in its Astro config.
 */

import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import { rehypeDocsChrome } from "./rehypeDocsChrome.ts";
import { remarkCallouts } from "./remarkCallouts.ts";
import { type DocsLinksOptions, remarkDocsLinks } from "./remarkDocsLinks.ts";
import { remarkExampleLabels } from "./remarkExampleLabels.ts";
import { remarkMermaid } from "./remarkMermaid.ts";
import { remarkPageHead } from "./remarkPageHead.ts";

export type { DocsLinksOptions } from "./remarkDocsLinks.ts";
export {
  rehypeDocsChrome,
  remarkCallouts,
  remarkDocsLinks,
  remarkExampleLabels,
  remarkMermaid,
  remarkPageHead,
};

export const docsRemarkPlugins = (links: DocsLinksOptions) =>
  [
    remarkPageHead,
    [remarkDocsLinks, links],
    remarkExampleLabels,
    remarkMermaid,
    remarkCallouts,
  ] as const;

export const docsRehypePlugins = [rehypeHeadingIds, rehypeDocsChrome] as const;
