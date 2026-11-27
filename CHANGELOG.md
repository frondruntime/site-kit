# Changelog

One line per change a site must act on: a renamed token, a changed prop, a moved file.

## 0.1.0

- First version, taken from Pinna's `apps/site` at `de16915`. Against that site:
  - The footer art token `--sprouts` is now `--footer-art`, sized by `--footer-art-size`, and set by
    the site; the kit sets neither.
  - The code theme is `codeTheme`, named `site-kit-dark` (was `pinnaCodeTheme`, `pinna-dark`).
  - The docs page's chrome is `DocsShell`, inside a site's own docs layout; the site imports
    `styles/docs.css` before `BaseLayout` and passes `SiteFooter` in the `footer` slot.
  - `inlineRegions(page, text, samplesDir)` takes the samples folder.
  - `window.__pinnaDocsBehavior` and the GA snippet's `pinnaGa*` names are `siteKit*`.
