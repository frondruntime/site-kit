import { getCollection } from "astro:content";
import { markdownResponse, renderMarkdownPages } from "@frondruntime/site-kit/llms";
import type { APIRoute, GetStaticPaths } from "astro";
import { llms } from "../../site";

export const getStaticPaths = (async () =>
  renderMarkdownPages(llms, await getCollection("docs")).map((page) => ({
    params: { path: page.path.slice("/docs/".length, -".md".length) },
    props: { body: page.body },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => markdownResponse(props.body as string);
