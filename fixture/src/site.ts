import { docsPath } from "@frondruntime/site-kit/sidebar";
import type { HeaderLink, SidebarGroup, SiteIdentity } from "@frondruntime/site-kit/types";
import nav from "./config/nav.json";

/** What the fixture says about itself, for the kit's components and helpers. */
export const site: SiteIdentity = {
  name: "Fixture",
  url: "https://fixture.example.dev",
  description: "Fixture — the site the kit's own check builds.",
  ogImageAlt: "Fixture",
  repositoryUrl: "https://github.com/frondruntime/site-kit",
  licenseUrl: "https://opensource.org/licenses/MIT",
  author: {
    name: "Fixture Author",
    url: "https://author.example.dev",
    id: "https://author.example.dev/#person",
    twitterHandle: "@fixture",
    sameAs: ["https://github.com/frondruntime"],
  },
  organization: {
    id: "https://frondruntime.dev/#organization",
    name: "Frond",
    url: "https://frondruntime.dev",
    profile: "https://github.com/frondruntime",
  },
};

export const sidebar: ReadonlyArray<SidebarGroup> = nav.groups;

export const headerLinks: ReadonlyArray<HeaderLink> = [
  { id: "docs", label: "Docs", href: docsPath("start") },
  { id: "github", label: "GitHub", href: site.repositoryUrl, newTab: true },
  { id: "llms", label: "llms.txt", href: "/llms.txt", newTab: true },
];

export const footer = {
  mark: "FIXTURE",
  credit: { label: "frondruntime", href: "https://github.com/frondruntime" },
  repositoryUrl: site.repositoryUrl,
};

export const llms = {
  ...site,
  intro: "Each link points to the Markdown source of a fixture page.",
  fullIntro: "This file is generated mechanically from the fixture's Markdown source.",
  sidebar,
};
