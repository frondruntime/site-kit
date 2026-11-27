import { getCollection } from "astro:content";
import { renderLlmsIndex, textResponse } from "@frondruntime/site-kit/llms";
import type { APIRoute } from "astro";
import { llms } from "../site";

export const GET: APIRoute = async () =>
  textResponse(renderLlmsIndex(llms, await getCollection("docs")));
