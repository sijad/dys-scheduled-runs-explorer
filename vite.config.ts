import { readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import ejs from "ejs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { autoComplete, Plugin as importToCDN } from "vite-plugin-cdn-import";
import { ViteMinifyPlugin } from "vite-plugin-minify";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/_": "https://dysonvalidator.com",
    },
  },
  plugins: [
    importToCDN({
      modules: [
        autoComplete("react"),
        autoComplete("react-dom"),
        {
          name: "react-query",
          var: "ReactQuery",
          path: "https://cdn.jsdelivr.net/npm/react-query@3/dist/react-query.production.min.js",
        },
        {
          name: "json-format-highlight",
          var: "jsonFormatHighlight",
          path: "https://cdn.jsdelivr.net/npm/json-format-highlight@1.0.4/dist/json-format-highlight.min.js",
        },
      ],
    }),
    react(),
    viteSingleFile(),
    ViteMinifyPlugin(),
    generateContract(),
  ],
});

function generateContract(): any {
  let config;
  let distPath;

  return {
    name: "vite-plugin-generate-contract",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      distPath = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      if (config.command === "serve") {
        return;
      }

      const template = readFileSync("./contract.ejs", "utf-8");
      const script = readFileSync("./contracts/main.py", "utf-8");
      const output = readFileSync(join(distPath, "index.html"), "utf-8");

      const filePath = join(distPath, "contract.py");
      const fileContent = ejs.render(template, { script, output });

      writeFileSync(filePath, fileContent, { flag: "w" });
    },
  };
}
