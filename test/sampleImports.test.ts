import { expect, test } from "bun:test";
import { sampleImports } from "../src/lib/sampleImports.ts";

test("imports written with either quote are found", () => {
  const source = ['import { a } from "one";', "import { b } from 'two';", ""].join("\n");
  expect(sampleImports(source, "a(); b();")).toEqual([
    { from: "one", names: ["a"] },
    { from: "two", names: ["b"] },
  ]);
});
