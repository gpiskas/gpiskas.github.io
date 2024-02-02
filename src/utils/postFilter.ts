import { SITE } from "@config";
import type { Post } from "types";

const postFilter = <T extends Post>({ data }: T) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default postFilter;
