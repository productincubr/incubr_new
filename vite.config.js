import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { POSTS } from "./src/blogPosts.js";

// The live site is served as static files, which only answer for files that exist.
// Without this, refreshing /book-a-call or a blog link returns "Not Found".
// Writing the app's index.html into a folder per route lets any static host serve it.
const ROUTES = ["book-a-call", "blog", ...POSTS.map((post) => `blog/${post.slug}`)];

function staticRoutes() {
  let outDir = "dist";
  return {
    name: "static-routes",
    apply: "build",
    configResolved(config) { outDir = config.build.outDir; },
    async closeBundle() {
      const html = await readFile(join(outDir, "index.html"), "utf8");
      for (const route of ROUTES) {
        await mkdir(join(outDir, route), { recursive: true });
        await writeFile(join(outDir, route, "index.html"), html);
        // Some hosts map /route to route.html instead of route/index.html.
        await writeFile(join(outDir, `${route}.html`), html);
      }
      // Fallback for unknown paths on hosts that serve 404.html (the app shows its own not-found view).
      await writeFile(join(outDir, "404.html"), html);
    },
  };
}

export default defineConfig({
  plugins: [react(), staticRoutes()],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
