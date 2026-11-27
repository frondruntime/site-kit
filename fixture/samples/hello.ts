import { readFileSync } from "node:fs";
import { join } from "node:path";

// #region greet
export const greet = (name: string): string => join("hello", name);
// #endregion

export const unused = readFileSync;
