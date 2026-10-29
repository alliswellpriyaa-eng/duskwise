import { defineConfig } from "tsup";

export default defineConfig([
  {
    // npm consumers: ESM + CommonJS + type declarations
    entry: { index: "src/engine/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    clean: false,
    sourcemap: true,
    target: "es2020",
  },
  {
    // <script> tag users: one file that exposes window.Duskwise
    entry: { duskwise: "src/engine/index.ts" },
    format: ["iife"],
    globalName: "Duskwise",
    minify: true,
    clean: false,
    target: "es2020",
    outExtension: () => ({ js: ".global.js" }),
  },
]);
