// Bundles the CSS layers into dist/duskwise.css (and a minified copy).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["tokens.css", "base.css", "classless.css", "components.css", "looks.css", "utilities.css"];

const header =
  `/*! Duskwise - comfort-first styling that adapts to the time of day. MIT License. */\n` +
  `/* Layer order: later layers win. Your own un-layered CSS always wins over all of them. */\n` +
  `@layer dw.tokens, dw.reset, dw.base, dw.classless, dw.components, dw.looks, dw.utilities;\n\n`;

const body = files.map((f) => readFileSync(resolve(root, "src/css", f), "utf8")).join("\n");
const full = header + body;

const minified = full
  .replace(/\/\*(?!!)[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  // Never remove the space before ":" - in selectors ".a :is(.b)" means a descendant.
  .replace(/\s*([{};,>])\s*/g, "$1")
  .replace(/:\s+/g, ":")
  .replace(/;}/g, "}")
  .trim();

mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(resolve(root, "dist/duskwise.css"), full);
writeFileSync(resolve(root, "dist/duskwise.min.css"), minified + "\n");
console.log(`dist/duskwise.css ${(full.length / 1024).toFixed(1)} KB, minified ${(minified.length / 1024).toFixed(1)} KB`);
