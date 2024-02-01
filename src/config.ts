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
    name: "Stripe",
    href: "https://buy.stripe.com/28obMAdue2or07udQR",
    linkTitle: `Support ${SITE.author} via Stripe (Recurring)`,
    active: true,
  },
  {
    name: "Coin",
    href: "https://donate.stripe.com/9AQcQE61M6EHcUg9AA",
    linkTitle: `Support ${SITE.author} via Stripe (One-time)`,
    active: true,
  },
  {
    name: "PayPal",
    href: "https://paypal.me/gpiskas",
    linkTitle: `Support ${SITE.author} via PayPal`,
    active: true,
  },
  {
    name: "Coffee",
    href: "https://ko-fi.com/gpiskas",
    linkTitle: `Support ${SITE.author} via Ko-Fi`,
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
  }
];
