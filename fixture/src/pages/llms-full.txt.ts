import { getCollection } from "astro:content";
import { renderLlmsFull, textResponse } from "@frondruntime/site-kit/llms";
import type { APIRoute } from "astro";
import { llms } from "../site";

export const GET: APIRoute = async () =>
  textResponse(renderLlmsFull(llms, await getCollection("docs")));
