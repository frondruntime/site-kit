/**
 * Expands the region markers of a docs page into the samples they name. A
 * page names one on a line of its own:
 *
 *     <!-- region start.tsx#node -->
 *
 * and the expansion carries that region in a fenced block in its place. The
 * region is the lines between `// #region node` and the next `// #endregion`
 * of a file in the site's samples folder, dedented, without
 * `@ts-expect-error` lines, under the imports of its file it uses
 * (`sampleImports.ts`). An unknown file or region, or a marker that does not
 * parse, throws a `RegionError` naming the page.
 *
 * The sync expands every page the site copies, so the site prints the code its
 * repository's type check compiles. A repository may expand other pages through
 * it too, such as the pages an agent skill carries.
 */

import { existsSync, readFileSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { withImports } from "./sampleImports.ts";

const markerStart = "<!-- region";
const marker = /^<!-- region ([\w./-]+)#([\w-]+) -->$/;
const fenceLanguages: Readonly<Record<string, string>> = { ".ts": "ts", ".tsx": "tsx" };

/** A marker that names no region, or a region that does not parse. */
export class RegionError extends Error {
  override readonly name = "RegionError";
}

function fail(message: string): never {
  throw new RegionError(message);
}

const sources = new Map<string, string>();

function sourceOf(page: string, regionsDir: string | undefined, file: string): string {
  if (regionsDir === undefined) {
    fail(`${page}: names region file ${file}, and the site sets no samples folder`);
  }
  const path = resolve(regionsDir, file);
  if (relative(regionsDir, path).startsWith("..")) {
    fail(`${page}: region file ${file} is outside ${regionsDir}`);
  }
  const cached = sources.get(path);
  if (cached !== undefined) return cached;
  if (!existsSync(path)) {
    fail(`${page}: region file ${file} does not exist in ${regionsDir}`);
  }
  const source = readFileSync(path, "utf8");
  sources.set(path, source);
  return source;
}

/** The lines of `// #region <name>` in `file`, dedented, as a fenced block. */
function region(page: string, regionsDir: string | undefined, file: string, name: string): string {
  const language = fenceLanguages[extname(file)];
  if (language === undefined) {
    fail(`${page}: region file ${file} is not a .ts or .tsx sample`);
  }
  const lines = sourceOf(page, regionsDir, file).split("\n");
  const opens = lines.flatMap((line, index) =>
    line.trim() === `// #region ${name}` ? [index] : [],
  );
  const start = opens[0];
  if (start === undefined) {
    fail(`${page}: ${file} has no region "${name}"`);
  }
  if (opens.length > 1) {
    fail(`${page}: ${file} declares region "${name}" ${opens.length} times`);
  }
  const end = lines.findIndex((line, index) => index > start && line.trim() === "// #endregion");
  if (end === -1) {
    fail(`${page}: region "${name}" in ${file} has no // #endregion`);
  }
  const body = lines.slice(start + 1, end).filter((line) => !line.includes("@ts-expect-error"));
  if (body.some((line) => line.trim().startsWith("// #region"))) {
    fail(`${page}: region "${name}" in ${file} contains another region`);
  }
  const filled = body.filter((line) => line.trim() !== "");
  if (filled.length === 0) {
    fail(`${page}: region "${name}" in ${file} is empty`);
  }
  // A region inside a declaration prints from its own indentation, not the file's.
  const indent = Math.min(...filled.map((line) => line.search(/\S/)));
  const code = withImports(
    sourceOf(page, regionsDir, file),
    body
      .map((line) => line.slice(indent))
      .join("\n")
      .trim(),
  );
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

/**
 * `text` with each region marker replaced by its region from a file in `regionsDir`, and how many
 * it replaced.
 */
export function inlineRegions(
  page: string,
  text: string,
  regionsDir: string | undefined,
): { readonly text: string; readonly count: number } {
  let count = 0;
  const lines = text.split("\n").map((line) => {
    if (!line.trim().startsWith(markerStart)) return line;
    const match = marker.exec(line.trim());
    if (match === null) {
      fail(
        `${page}: malformed region marker "${line.trim()}"; write <!-- region <file>#<name> -->`,
      );
    }
    count += 1;
    return region(page, regionsDir, match[1] ?? "", match[2] ?? "");
  });
  return { text: lines.join("\n"), count };
}
