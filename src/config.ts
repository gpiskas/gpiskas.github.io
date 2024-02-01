import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://gpiskas.github.io/", // replace this with your deployed domain
  author: "Georgios Piskas",
  desc: "Projects, Services & Posts by Georgios Piskas",
  title: "Georgios Piskas",
  lightAndDarkMode: true,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/gpiskas",
    linkTitle: `${SITE.author} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/gpiskas",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:gpiskas@gmail.com",
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
  },
  {
    name: "Rss",
    href: "/rss.xml",
    linkTitle: `RSS Feed`,
    active: true,
  },
];
