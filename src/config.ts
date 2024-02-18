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
    name: "Stripe",
    href: "https://buy.stripe.com/28obMAdue2or07udQR",
    linkTitle: "Support Georgios Piskas via Stripe (monthly subscription)",
    active: true,
  },
  {
    name: "Coin",
    href: "https://donate.stripe.com/9AQcQE61M6EHcUg9AA",
    linkTitle: "Support Georgios Piskas via Stripe (one-time donation)",
    active: true,
  },
  {
    name: "PayPal",
    href: "https://paypal.me/gpiskas",
    linkTitle: "Support Georgios Piskas via PayPal (one-time donation)",
    active: true,
  },
  {
    name: "Coffee",
    href: "https://ko-fi.com/gpiskas",
    linkTitle: "Support Georgios Piskas via Ko-Fi",
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/gpiskas",
    linkTitle: "Georgios Piskas on LinkedIn",
    active: true,
  },
  {
    name: "Github",
    href: "https://github.com/sponsors/gpiskas",
    linkTitle: "Georgios Piskas on GitHub",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:gpiskas@gmail.com",
    linkTitle: "Send an email to Georgios Piskas",
    active: true,
  },
];
