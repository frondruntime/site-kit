# AGENTS

`site-kit` holds the parts the Frond family's sites share: components, layouts, stylesheets, the
Markdown plugins, and helpers. Pinna's site and Frond's site install it from GitHub, pinned to a
commit. The owner decides; these rules hold until the owner says otherwise.

## Rules

1. **Reusables only.** No Astro integration, no injected routes, no virtual modules, no config file
   a site must write. A component takes props or slots, a helper takes arguments. A site wires the
   pieces in its own Astro config and routes.
2. **No product in the kit.** No product name, URL, copy, brand mark, or footer art in `src`: a site
   passes them in. The exceptions are the landing class names still listed in
   `design-system.css`'s shared recipes, which go when a second landing needs those recipes.
   The family's product hues are the other exception: `--pinna`, `--frond`, `--react`, `--effect`,
   `--react-hue`, `--effect-hue`, and the `.hue-*` classes, so a product reads in one color on every
   site.
3. **Remote state is the owner's call.** Pushing a branch and opening a pull request follow the
   owner's ask in the conversation; merging, tagging, and changing settings each need their own.
   Nothing here is ever published to npm: the package is `private: true`.
4. **Bun only**, through the `package.json` scripts. Report `bun run check` on the last commit.
5. **Exact versions.** Every dependency is pinned exactly, `astro` matching the sites.
6. **A token or prop change is a breaking change.** A site picks it up only when it moves its pin,
   so each such change gets one line in `CHANGELOG.md`, naming what a site must change.
7. **Keep the fixture building.** A new component or helper is used by the fixture, so the check
   covers it.
8. **Conventional Commits**, staged by path. American English, whole words.
9. **The look's reasons live in `design/house-style.md`.** A change to a token or a shared
   component updates it in the same commit.
