/** Canonical site URL for SEO (one canonical URL, per PRD). Defaults to the
 * primary custom domain; override with NEXT_PUBLIC_SITE_URL on the deployment
 * if it ever changes. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoria.app"
).replace(/\/$/, "");
