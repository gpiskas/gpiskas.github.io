import { getCollection } from "astro:content";
import type { PostEntry, ProjectEntry, Publication } from "types";

export function getPosts(includeDrafts: boolean = true): Promise<PostEntry[]> {
    return getCollection("posts", draftsFilter(includeDrafts));
}

export function getProjects(includeDrafts: boolean = true): Promise<ProjectEntry[]> {
    return getCollection("projects", draftsFilter(includeDrafts));
}

const draftsFilter = (includeDrafts: boolean) => (pub: Publication) => includeDrafts || !pub.data.draft;