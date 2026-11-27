import { unified } from "@astrojs/markdown-remark";
import { codeTheme } from "@frondruntime/site-kit/code-theme";
import { plexMono } from "@frondruntime/site-kit/fonts";
import { docsRehypePlugins, docsRemarkPlugins } from "@frondruntime/site-kit/plugins";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://fixture.example.dev",
  trailingSlash: "never",
  fonts: [plexMono],
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  markdown: {
    processor: unified({
      remarkPlugins: docsRemarkPlugins({
        corpusPath: "fixture/docs",
        repositoryBlob: "https://github.com/frondruntime/site-kit/blob/main",
      }),
      rehypePlugins: docsRehypePlugins,
    }),
    shikiConfig: { theme: codeTheme },
  },
});
