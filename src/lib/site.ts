/** Canonical site URL for SEO (one canonical URL, per PRD). Override with
 * NEXT_PUBLIC_SITE_URL on the deployment. Defaults to the current live URL;
 * switch to https://dinoria.com once that domain is connected. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoria.vercel.app"
).replace(/\/$/, "");
