import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import sitemap from "@astrojs/sitemap";
import mdx from '@astrojs/mdx';
import { SITE } from "./src/config";

SITE.website

const tags = new RegExp(SITE.website + "tags/.*");
const search = new RegExp(SITE.website + "search/.*");
const posts = new RegExp(SITE.website + "posts/(\\d+/)?$");
const projects = new RegExp(SITE.website + "projects/(\\d+/)?$");

const excludePagesFilter = (page: string) => {
  return tags.test(page)
    || search.test(page)
    || posts.test(page)
    || projects.test(page);
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap({
      filter: (page) => !excludePagesFilter(page),
    }),
    mdx(),
  ],
  image: {
    service: passthroughImageService(),
  },
  markdown: {
    remarkPlugins: [
      remarkToc,
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
