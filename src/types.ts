/** The shapes the kit's components and helpers take. A site holds the values. */

export interface SiteLink {
  readonly label: string;
  readonly href: string;
}

export interface SidebarItem {
  readonly label: string;
  readonly slug: string;
}

/** One group of a site's `nav.json`, which lists the sidebar by hand, in reading order. */
export interface SidebarGroup {
  readonly label: string;
  readonly items: ReadonlyArray<SidebarItem>;
}

export interface SitePerson {
  readonly name: string;
  readonly url: string;
  /** The JSON-LD `@id`, such as `https://example.dev/#person`. */
  readonly id: string;
  readonly twitterHandle: string;
  readonly sameAs: ReadonlyArray<string>;
}

export interface SiteOrganization {
  /** The JSON-LD `@id`. Sites that give the same id and facts describe one publisher. */
  readonly id: string;
  readonly name: string;
  readonly url: string;
  /** The organization's profile page, such as its GitHub organization. */
  readonly profile: string;
}

/** What a page's head says about the site: `BaseLayout`'s `site` prop and `createJsonLd`. */
export interface SiteIdentity {
  readonly name: string;
  /** The deployed origin, without a trailing slash. */
  readonly url: string;
  readonly description: string;
  /** Alt text for `/og-image.png`, which the site serves. */
  readonly ogImageAlt: string;
  readonly repositoryUrl: string;
  readonly licenseUrl: string;
  readonly author: SitePerson;
  readonly organization: SiteOrganization;
}

/** A header link. `id` names it for `current`. */
export interface HeaderLink extends SiteLink {
  readonly id: string;
  readonly newTab?: boolean;
}
