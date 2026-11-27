/**
 * Every sample a site prints shows its imports. A sample is a region of a file the site's
 * repository type-checks, and the file's imports sit above the region, so this module prints the
 * ones a region uses above it. The docs copy (`regions.ts`) prints through it, and a site's landing
 * page may too.
 */

interface Specifier {
  /** The name the file uses, after any `as`. */
  readonly local: string;
  /** The specifier as written in the braces, such as `type Read` or `a as b`. */
  readonly written: string;
  readonly type: boolean;
}

interface Declaration {
  readonly from: string;
  readonly typeOnly: boolean;
  readonly defaultName: string | undefined;
  readonly namespace: string | undefined;
  readonly named: ReadonlyArray<Specifier>;
}

/** The imports a region uses from one module. */
export interface SampleImport {
  readonly from: string;
  readonly names: ReadonlyArray<string>;
}

const declarationPattern = /^import\s+(type\s+)?([^;]*?)\s+from\s+"([^"]+)";/gm;

const parseSpecifier = (text: string): Specifier => {
  const type = text.startsWith("type ");
  const name = type ? text.slice("type ".length).trim() : text;
  const local = name.split(/\s+as\s+/).at(-1) ?? name;
  return { local, written: text, type };
};

const parseDeclarations = (source: string): ReadonlyArray<Declaration> =>
  [...source.matchAll(declarationPattern)].map((match) => {
    const clause = (match[2] ?? "").trim();
    const braces = /\{([^}]*)\}/.exec(clause);
    const outside = clause
      .replace(/\{[^}]*\}/, "")
      .replace(/,/g, " ")
      .trim();
    const namespace = /^\*\s+as\s+([\w$]+)$/.exec(outside)?.[1];
    return {
      from: match[3] ?? "",
      typeOnly: match[1] !== undefined,
      defaultName: namespace === undefined && outside !== "" ? outside : undefined,
      namespace,
      named: (braces?.[1] ?? "")
        .split(",")
        .map((text) => text.trim())
        .filter((text) => text !== "")
        .map(parseSpecifier),
    };
  });

// Code without its strings and comments, so a word in either does not count as a use.
const codeOnly = (code: string): string =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) =>
      line
        .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
        .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
        .replace(/\/\/.*$/, ""),
    )
    .join("\n");

const escapePattern = (text: string): string => text.replace(/[$]/g, "\\$");

// A name used as itself, not as a property (`observable.box`) or a longer name (`$box`, `boxes`).
const uses = (code: string, name: string): boolean =>
  new RegExp(`(?<![\\w$.])${escapePattern(name)}(?![\\w$])`).test(code);

const hasOwnImports = (code: string): boolean => /^import\s/m.test(code);

interface Used {
  readonly declaration: Declaration;
  readonly defaultName: string | undefined;
  readonly namespace: string | undefined;
  readonly named: ReadonlyArray<Specifier>;
}

const usedImports = (source: string, code: string): ReadonlyArray<Used> => {
  const plain = codeOnly(code);
  const used = (name: string | undefined): string | undefined =>
    name !== undefined && uses(plain, name) ? name : undefined;
  return parseDeclarations(source).flatMap((declaration) => {
    const entry: Used = {
      declaration,
      defaultName: used(declaration.defaultName),
      namespace: used(declaration.namespace),
      named: declaration.named.filter((specifier) => uses(plain, specifier.local)),
    };
    const any =
      entry.defaultName !== undefined || entry.namespace !== undefined || entry.named.length > 0;
    return any ? [entry] : [];
  });
};

// The width the formatter wraps at.
const lineWidth = 100;

const printImport = ({ declaration, defaultName, namespace, named }: Used): string => {
  const keyword = declaration.typeOnly ? "import type" : "import";
  const from = ` from "${declaration.from}";`;
  const head = [defaultName, namespace === undefined ? undefined : `* as ${namespace}`].filter(
    (part) => part !== undefined,
  );
  if (named.length === 0) return `${keyword} ${head.join(", ")}${from}`;
  const written = named.map((specifier) => specifier.written);
  const prefix = head.length > 0 ? `${head.join(", ")}, ` : "";
  const line = `${keyword} ${prefix}{ ${written.join(", ")} }${from}`;
  if (line.length <= lineWidth) return line;
  return `${keyword} ${prefix}{\n${written.map((text) => `  ${text},`).join("\n")}\n}${from}`;
};

/**
 * `code`, a region of `source`, with the imports of `source` it uses printed above it, in the
 * file's order. A region that writes its own imports is printed as it is.
 */
export const withImports = (source: string, code: string): string => {
  if (hasOwnImports(code)) return code;
  const imports = usedImports(source, code).map(printImport);
  return imports.length === 0 ? code : `${imports.join("\n")}\n\n${code}`;
};

/** The names `code`, a region of `source`, imports, by module. */
export const sampleImports = (source: string, code: string): ReadonlyArray<SampleImport> =>
  usedImports(source, code).map(({ declaration, defaultName, namespace, named }) => ({
    from: declaration.from,
    names: [
      ...(defaultName === undefined ? [] : [defaultName]),
      ...(namespace === undefined ? [] : [`* as ${namespace}`]),
      ...named.map((specifier) => specifier.local),
    ],
  }));
