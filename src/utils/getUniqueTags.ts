import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";
import type { PostEntry } from "types";

interface Tag {
  tag: string;
  tagName: string;
}

const getUniqueTags = (posts: PostEntry[]) => {
  const tags: Tag[] = posts
    .filter(postFilter)
    .flatMap(post => post.data.tags)
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  return tags;
};

export default getUniqueTags;
