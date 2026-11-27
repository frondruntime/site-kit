import type { SiteIdentity } from "../types.ts";

/** The social card every site serves from its own origin. */
export const ogImageOf = (site: SiteIdentity): string => `${site.url}/og-image.png`;

interface JsonLdPage {
  title: string;
  description: string;
  url: string;
}

/** The page's JSON-LD graph: the author, the publisher, the site, the software, and the page. */
export function createJsonLd(site: SiteIdentity, { title, description, url }: JsonLdPage) {
  const siteUrl = site.url;
  const pageIdUrl = url === siteUrl ? `${siteUrl}/` : url;
  const siteAuthor = site.author;
  const projectOrganization = site.organization;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": siteAuthor.id,
        name: siteAuthor.name,
        url: siteAuthor.url,
        sameAs: [...siteAuthor.sameAs],
      },
      {
        "@type": "Organization",
        "@id": projectOrganization.id,
        name: projectOrganization.name,
        url: projectOrganization.url,
        sameAs: [projectOrganization.profile],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: site.name,
        url: siteUrl,
        description: site.description,
        inLanguage: "en-US",
        author: { "@id": siteAuthor.id },
        publisher: { "@id": projectOrganization.id },
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${siteUrl}/#software`,
        name: site.name,
        url: siteUrl,
        description: site.description,
        programmingLanguage: "TypeScript",
        codeRepository: site.repositoryUrl,
        license: site.licenseUrl,
        sameAs: [site.repositoryUrl],
        image: ogImageOf(site),
        author: { "@id": siteAuthor.id },
        publisher: { "@id": projectOrganization.id },
      },
      {
        "@type": "WebPage",
        "@id": `${pageIdUrl}#webpage`,
        url,
        name: title,
        description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${siteUrl}/#website` },
        author: { "@id": siteAuthor.id },
        about: { "@id": `${siteUrl}/#software` },
      },
    ],
  };
}
