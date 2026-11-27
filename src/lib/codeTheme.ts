import { palette } from "./palette.ts";

export const codeTheme = {
  name: "site-kit-dark",
  type: "dark" as const,
  settings: [
    {
      settings: {
        background: palette.bgDim,
        foreground: palette.prose,
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier", "keyword.operator.expression"],
      settings: { foreground: palette.amber },
    },
    {
      scope: ["string", "constant.language", "constant.numeric"],
      settings: { foreground: palette.accent },
    },
    {
      scope: ["entity.name.function", "support.function", "variable.language", "support.variable"],
      settings: { foreground: palette.cyan },
    },
    {
      scope: ["entity.name.type", "support.class", "support.type"],
      settings: { foreground: palette.pink },
    },
    {
      scope: ["entity.name.tag", "punctuation.definition.tag"],
      settings: { foreground: "#f29fb3" },
    },
    {
      scope: [
        "entity.other.attribute-name",
        "support.type.property-name",
        "variable.other.property",
      ],
      settings: { foreground: "#b8d878" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.delimiter"],
      settings: { foreground: "#9aaab0" },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: palette.muted, fontStyle: "italic" },
    },
  ],
};
