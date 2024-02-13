import type { PostEntry } from "types";
import Datetime from "./Datetime";

export interface Props {
  href?: string;
  frontmatter: PostEntry["data"];
}

export default function PostCard({ href, frontmatter }: Props) {
  const { title, pubDatetime, modDatetime, description } = frontmatter;

  const headerProps = {
    className: "text-lg line-clamp-2-inline font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        <h2 {...headerProps}>{title}</h2>
      </a>
      <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
      <p className="line-clamp-3-inline sm:line-clamp-2-inline">{description}</p>
    </li>
  );
}
