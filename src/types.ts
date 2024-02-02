import type socialIcons from "@assets/socialIcons";
import type { CollectionEntry } from "astro:content";

export type Site = {
  website: string;
  author: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerPage: number;
  scheduledPostMargin: number;
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
  ariaLabel?: string;
}[];

export type BlogPost = CollectionEntry<"blog">;
export type ProjectPost = CollectionEntry<"projects">;
export type Post = BlogPost | ProjectPost;
