import type { APIRoute } from "astro";
import { generateOgImageForProject } from "@utils/generateOgImages";
import { slugifyStr } from "@utils/slugify";
import type { ProjectEntry } from "types";
import { getProjects } from "@utils/collections";

export async function getStaticPaths() {
  const posts = await getProjects().then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { slug: slugifyStr(post.data.title) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await generateOgImageForProject(props as ProjectEntry), {
    headers: { "Content-Type": "image/png" },
  });
