/** Canonical site URL for SEO (one canonical URL, per PRD). Override with
 * NEXT_PUBLIC_SITE_URL on the deployment; defaults to the production domain. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoria.com"
).replace(/\/$/, "");
