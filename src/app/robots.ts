import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// A crawler matching one of these by name uses ONLY its own block and
// ignores the "*" rule below entirely — so /admin has to be disallowed
// again in every named block, not just once under "*".
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'PerplexityBot',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'cohere-ai',
  'Diffbot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/admin' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: '/admin' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
