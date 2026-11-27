/**
 * Helpers over a site's sidebar, which its `nav.json` lists by hand, in reading order. The sync
 * (`syncDocs`) fails when an entry names no page.
 */

import type { SidebarGroup, SidebarItem } from "../types.ts";

export function flatSidebarItems(sidebar: ReadonlyArray<SidebarGroup>): ReadonlyArray<SidebarItem> {
  return sidebar.flatMap((g) => g.items);
}

export function docsPath(slug: string): string {
  return `/docs/${slug}`;
}

export function getPagination(
  sidebar: ReadonlyArray<SidebarGroup>,
  slug: string,
): {
  prev: SidebarItem | null;
  next: SidebarItem | null;
} {
  const items = flatSidebarItems(sidebar);
  const idx = items.findIndex((item) => item.slug === slug);
  return {
    prev: idx > 0 ? (items[idx - 1] ?? null) : null,
    next: idx < items.length - 1 ? (items[idx + 1] ?? null) : null,
  };
}
