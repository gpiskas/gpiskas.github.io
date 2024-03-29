import type { APIRoute } from "astro";
import { generateOgImageForPost } from "@utils/generateOgImages";
import { slugifyStr } from "@utils/slugify";
import type { PostEntry } from "types";
import { getPosts } from "@utils/collections";

export async function getStaticPaths() {
  const posts = await getPosts().then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { slug: slugifyStr(post.data.title) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await generateOgImageForPost(props as PostEntry), {
    headers: { "Content-Type": "image/png" },
  });
