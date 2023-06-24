import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  minify: true,
  hash: true,
  clean: true,
  include: ["./{app,components}/**/*.{js,jsx,ts,tsx}"],
  outdir: "styled-system",
});
