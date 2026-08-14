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
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
      type: 'website',
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      site: seo.twitterHandle || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}
