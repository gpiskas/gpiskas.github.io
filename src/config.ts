import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://gpiskas.com/",
  author: "Georgios Piskas",
  desc: "Projects, Services & Posts by Georgios Piskas",
  title: "Georgios Piskas",
  lightAndDarkMode: true,
  ogImage: "og.png",
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const SOCIALS: SocialObjects = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/gpiskas",
    linkTitle: "Georgios Piskas on LinkedIn",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:gpiskas@gmail.com",
    linkTitle: "Send an email to Georgios Piskas",
    active: true,
  },
];
