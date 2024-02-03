import rss from "@astrojs/rss";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";
import { getPosts } from "@utils/collections";

export async function GET() {
  const posts = await getPosts();
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, slug }) => ({
      link: `posts/${slug}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
