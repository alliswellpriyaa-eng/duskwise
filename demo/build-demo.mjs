// Inlines the built CSS and engine into one self-contained demo page.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { noFlashScript } from "../dist/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");

const html = read("demo/demo.html")
  .replace("/*__CSS__*/", () => read("dist/duskwise.css"))
  .replace("/*__JS__*/", () => read("dist/duskwise.global.js"))
  .replace("/*__NOFLASH__*/", () => noFlashScript());

mkdirSync(resolve(root, "demo/dist"), { recursive: true });
writeFileSync(resolve(root, "demo/dist/index.html"), html);
console.log(`demo/dist/index.html ${(html.length / 1024).toFixed(1)} KB`);
