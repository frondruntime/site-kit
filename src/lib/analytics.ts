/**
 * The one switch for every analytics script on the site. Off unless a
 * production build sets PUBLIC_ANALYTICS=on, so dev servers and local
 * previews load nothing.
 */
export const analyticsEnabled = import.meta.env.PROD && import.meta.env.PUBLIC_ANALYTICS === "on";
