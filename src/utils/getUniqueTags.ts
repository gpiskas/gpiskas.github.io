import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";
import type { Post } from "types";

interface Tag {
  tag: string;
  tagName: string;
}

const getUniqueTags = <T extends Post>(posts: T[]) => {
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
