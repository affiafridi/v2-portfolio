import type { Metadata } from 'next'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export interface SeoSettings {
  siteName: string
  titleTemplate: string
  defaultTitle: string
  defaultDescription: string
  defaultOgImage: string
  twitterHandle: string
  work: { title: string; description: string }
  services: { title: string; description: string }
  blog: { title: string; description: string }
}

export const SEO_DEFAULTS: SeoSettings = {
  siteName: 'Aftab',
  titleTemplate: '%s | Aftab',
  defaultTitle: 'Aftab — Creative Developer',
  defaultDescription:
    'Creative developer crafting immersive digital experiences that push the limits of the web.',
  defaultOgImage: '',
  twitterHandle: '',
  work: { title: 'Work', description: '' },
  services: { title: 'Services', description: '' },
  blog: { title: 'Blog', description: '' },
}

// SiteSettings.data is a loosely-typed JSON blob — this merges whatever the
// admin has saved under its `seo` key over the defaults so every field is
// always present, even for settings saved before this feature existed.
export function getSeoSettings(settingsData: Record<string, unknown>): SeoSettings {
  const seo = (settingsData?.seo as Partial<SeoSettings>) || {}
  return {
    ...SEO_DEFAULTS,
    ...seo,
    work: { ...SEO_DEFAULTS.work, ...(seo.work || {}) },
    services: { ...SEO_DEFAULTS.services, ...(seo.services || {}) },
    blog: { ...SEO_DEFAULTS.blog, ...(seo.blog || {}) },
  }
}

/* Identity graph for the site owner.

   This is the piece answer engines (ChatGPT, Perplexity, Google AI
   Overviews) and the Knowledge Panel actually read to work out *who*
   this site is about — page copy alone leaves them guessing. `sameAs`
   is what links this site to the same person's other profiles, which is
   how those systems gain confidence it's one entity rather than several.

   `address` carries the geographic signal for "developer in Dubai"-type
   queries; `knowsAbout` carries the topical one. Both are drawn from
   real admin settings rather than invented, and any field that isn't
   filled in is dropped rather than emitted empty — a half-populated
   entity is worse than a smaller, fully accurate one. */
interface PersonJsonLdInput {
  name:        string
  jobTitle?:   string
  description?: string
  image?:      string
  email?:      string
  location?:   string
  sameAs?:     string[]
  knowsAbout?: string[]
}

export function personJsonLd({ name, jobTitle, description, image, email, location, sameAs, knowsAbout }: PersonJsonLdInput) {
  const [locality, country] = (location || '').split(',').map(s => s.trim())

  return stripEmpty({
    '@context': 'https://schema.org',
    '@type':    'Person',
    '@id':      `${SITE_URL}/#person`,
    name,
    url:        SITE_URL,
    jobTitle,
    description,
    image:      image ? absoluteUrl(image) : undefined,
    email:      email ? `mailto:${email}` : undefined,
    address:    locality
      ? stripEmpty({ '@type': 'PostalAddress', addressLocality: locality, addressCountry: country })
      : undefined,
    sameAs:     sameAs?.length     ? sameAs     : undefined,
    knowsAbout: knowsAbout?.length ? knowsAbout : undefined,
  })
}

export function webSiteJsonLd({ siteName, description }: { siteName: string; description?: string }) {
  return stripEmpty({
    '@context':   'https://schema.org',
    '@type':      'WebSite',
    '@id':        `${SITE_URL}/#website`,
    url:          SITE_URL,
    name:         siteName,
    description,
    /* Points at the Person node above rather than repeating it, so the
       two form one connected graph instead of two loose objects. */
    publisher:    { '@id': `${SITE_URL}/#person` },
    inLanguage:   'en',
  })
}

/* Breadcrumbs let Google render the "Home › Work › Project" trail in
   results instead of a bare URL, and give answer engines the site's
   hierarchy explicitly. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      name:      t.name,
      item:      absoluteUrl(t.path),
    })),
  }
}

/* JSON-LD consumers treat an explicit null/empty string as an assertion
   that the value is absent, which is a worse signal than omitting the
   key. Recurses so nested nodes (PostalAddress) get the same treatment. */
function stripEmpty<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as T
}

/* Services had no structured data at all, unlike work and blog. Schema
   "Service" is what lets an answer engine state what this person offers
   and where, rather than inferring it from prose. provider points at the
   shared Person node so it joins the same graph. */
interface ServiceJsonLdInput {
  title:        string
  description:  string
  image?:       string
  path:         string
  providerName: string
  areaServed?:  string
}

export function serviceJsonLd({ title, description, image, path, providerName, areaServed }: ServiceJsonLdInput) {
  const url = absoluteUrl(path)
  return stripEmpty({
    '@context':   'https://schema.org',
    '@type':      'Service',
    name:         title,
    description,
    url,
    serviceType:  title,
    image:        image ? absoluteUrl(image) : undefined,
    provider:     { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: providerName },
    areaServed:   areaServed || undefined,
  })
}

interface CreativeWorkJsonLdInput {
  title: string
  description: string
  image?: string
  path: string
  dateCreated?: Date
  dateModified?: Date
  authorName: string
}

export function creativeWorkJsonLd({ title, description, image, path, dateCreated, dateModified, authorName }: CreativeWorkJsonLdInput) {
  const url = absoluteUrl(path)
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url,
    mainEntityOfPage: url,
    image: image ? absoluteUrl(image) : undefined,
    dateCreated: dateCreated?.toISOString(),
    dateModified: (dateModified ?? dateCreated)?.toISOString(),
    creator: { '@type': 'Person', name: authorName },
    publisher: { '@type': 'Person', name: authorName },
  }
}

interface BlogPostingJsonLdInput {
  title: string
  description: string
  image?: string
  path: string
  datePublished?: string
  dateModified?: Date
  authorName: string
}

// Post.date is a free-text field (e.g. "12 May 2025"), not a real DateTime,
// so this needs to tolerate values Date can't parse.
export function blogPostingJsonLd({ title, description, image, path, datePublished, dateModified, authorName }: BlogPostingJsonLdInput) {
  const parsed = datePublished ? new Date(datePublished) : undefined
  const iso = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : undefined
  const url = absoluteUrl(path)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    image: image ? absoluteUrl(image) : undefined,
    datePublished: iso,
    dateModified: (dateModified?.toISOString()) ?? iso,
    author: { '@type': 'Person', name: authorName },
    publisher: { '@type': 'Person', name: authorName },
  }
}

interface BuildMetadataInput {
  title: string
  description?: string
  image?: string
  path: string
  noindex?: boolean
  seo: SeoSettings
}

// Next.js does NOT deep-merge `openGraph`/`twitter` between a layout and the
// page that fills a segment — whichever one defines the key wins outright.
// Since every page below the root layout defines its own via this function,
// site-wide values (siteName, twitter handle) have to be threaded through
// here explicitly, or they'd silently disappear the moment a page sets its
// own openGraph/twitter object.
export function buildMetadata({ title, description, image, path, noindex, seo }: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path)
  const ogImage = image ? absoluteUrl(image) : undefined

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: seo.siteName,
      /* Spread rather than `images: undefined`. Next.js fills the key
         from the generated opengraph-image route only when it is absent
         — present-but-undefined counts as "the page decided", and the
         page would end up with no image at all. Pages that DO have a
         real cover (projects, posts) still override it here. */
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
      type: 'website',
    },
    twitter: {
      /* Always the large card: every route now resolves to an image,
         either its own or the generated default. */
      card: 'summary_large_image',
      title,
      description,
      site: seo.twitterHandle || undefined,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}
