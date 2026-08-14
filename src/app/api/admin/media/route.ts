import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg', '.ogv']

function inferType(url: string): 'image' | 'video' {
  const ext = path.extname(url.split('?')[0]).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'image'
}

function urlToFilename(url: string): string {
  const clean = url.split('?')[0]
  const base = path.basename(clean) || 'image'
  return base.includes('.') ? base : `${base}.jpg`
}

// Local (public/) files can be stat'd for a real size; remote URLs (e.g.
// Unsplash placeholders from seed data) have no size we can cheaply get.
function localSize(url: string): number {
  if (!url.startsWith('/')) return 0
  const filePath = path.join(PUBLIC_DIR, url)
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
}

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const onDisk = fs.existsSync(UPLOAD_DIR)
      ? fs.readdirSync(UPLOAD_DIR).filter((f) => !f.startsWith('.'))
      : []
    const known = await prisma.mediaAsset.findMany()
    const knownFilenames = new Set(known.map((a) => a.filename))
    const knownUrls = new Set(known.map((a) => a.url))

    // Backfill any files that exist on disk but predate the media library
    // (e.g. uploaded before this table existed) — same reconciliation
    // approach as content revalidation elsewhere. Use the file's real mtime
    // so it sorts by when it was actually added, not by "now".
    const orphaned = onDisk.filter((f) => !knownFilenames.has(f))
    if (orphaned.length > 0) {
      await prisma.mediaAsset.createMany({
        data: orphaned.map((f) => ({
          url: `/uploads/${f}`,
          filename: f,
          type: inferType(f),
          title: f.replace(/^\d+-/, '').replace(/\.[^.]+$/, ''),
          size: fs.statSync(path.join(UPLOAD_DIR, f)).size,
          createdAt: fs.statSync(path.join(UPLOAD_DIR, f)).mtime,
        })),
        skipDuplicates: true,
      })
      orphaned.forEach((f) => knownUrls.add(`/uploads/${f}`))
    }

    // Backfill file size for rows created before the `size` column existed.
    const missingSize = known.filter((a) => a.size === 0 && knownFilenames.has(a.filename))
    if (missingSize.length > 0) {
      await Promise.all(
        missingSize.map((a) => {
          const filePath = path.join(UPLOAD_DIR, a.filename)
          if (!fs.existsSync(filePath)) return null
          return prisma.mediaAsset.update({
            where: { id: a.id },
            data: { size: fs.statSync(filePath).size },
          })
        })
      )
    }

    // Pull in every image URL actually referenced across the site's content
    // (project covers/galleries, service/post covers, settings images) that
    // isn't already tracked, so the library reflects everything in use —
    // not just what was uploaded through the picker.
    const [projects, services, posts, settings] = await Promise.all([
      prisma.project.findMany({ select: { image: true, gallery: true } }),
      prisma.service.findMany({ select: { image: true } }),
      prisma.post.findMany({ select: { image: true } }),
      prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    ])

    const referenced = new Set<string>()
    projects.forEach((p) => {
      if (p.image) referenced.add(p.image)
      p.gallery.forEach((g) => g && referenced.add(g))
    })
    services.forEach((s) => { if (s.image) referenced.add(s.image) })
    posts.forEach((p) => { if (p.image) referenced.add(p.image) })

    const settingsData = settings?.data as Record<string, any> | undefined
    if (settingsData?.hero?.portraitImage) referenced.add(settingsData.hero.portraitImage)
    ;(settingsData?.about?.images || []).forEach((u: string) => u && referenced.add(u))
    ;(settingsData?.footer?.images || []).forEach((u: string) => u && referenced.add(u))

    // These have no real "uploaded at" moment (seed data, external URLs), so
    // pin them to the epoch — otherwise they'd all land on "now" and bury
    // genuinely recent uploads under a wall of old placeholder content.
    const missingRefs = Array.from(referenced).filter((u) => !knownUrls.has(u))
    if (missingRefs.length > 0) {
      await prisma.mediaAsset.createMany({
        data: missingRefs.map((url) => {
          const filename = urlToFilename(url)
          return {
            url,
            filename,
            type: inferType(url),
            title: filename.replace(/\.[^.]+$/, ''),
            size: localSize(url),
            createdAt: new Date(0),
          }
        }),
        skipDuplicates: true,
      })
    }

    const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ files: assets })
  } catch {
    return NextResponse.json({ files: [] })
  }
}
