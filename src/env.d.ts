/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

export type BlogPost = CollectionEntry<"blog">;
export type ProjectPost = CollectionEntry<"projects">;
export type Post = BlogPost | ProjectPost;
