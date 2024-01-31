/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type BlogPost = CollectionEntry<"blog">;
type ProjectPost = CollectionEntry<"projects">;
type Post = BlogPost | ProjectPost;