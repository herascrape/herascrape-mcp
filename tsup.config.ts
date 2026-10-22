import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  dts: false,
  sourcemap: false,
  clean: true,
  minify: false,
  banner: { js: "#!/usr/bin/env node" },
});
