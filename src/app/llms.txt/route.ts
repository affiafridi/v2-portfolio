import { getProjects, getServices, getPublishedPosts, getSiteSettings } from '@/lib/data'
import { getSeoSettings, SITE_URL } from '@/lib/seo'

// llms.txt is an emerging (not yet formally standardized) convention that
// gives AI assistants a clean, curated summary of a site's content — an
// alternative to scraping/parsing HTML. See https://llmstxt.org
export async function GET() {
  const [projects, services, posts, settings] = await Promise.all([
    getProjects(),
    getServices(),
    getPublishedPosts(),
    getSiteSettings(),
  ])
  const seo = getSeoSettings(settings)

  const lines = [
    `# ${seo.siteName}`,
    '',
    `> ${seo.defaultDescription}`,
    '',
    '## Work',
    ...projects.map((p) => `- [${p.title}](${SITE_URL}/work/${p.slug}): ${p.description}`),
    '',
    '## Services',
    ...services.map((s) => `- [${s.title}](${SITE_URL}/services/${s.slug}): ${s.description}`),
    '',
    '## Blog',
    ...posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`),
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
