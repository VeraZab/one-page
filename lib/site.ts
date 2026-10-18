// Single source for site-wide identity + the production URL used in metadata,
// canonical links, sitemap, robots, and structured data. Override the URL with
// NEXT_PUBLIC_SITE_URL (e.g. when a custom domain is attached).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://one-page-bay.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Vera Zabeida";
export const AUTHOR = "Vera Zabeida";
export const SITE_DESCRIPTION =
  "Vera Zabeida — full-stack engineer. Writing on AI agents, web development, design, and data science.";
