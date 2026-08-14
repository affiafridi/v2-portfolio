import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  // Backfill any category values already used on posts but not yet tracked
  // as a proper PostCategory, so the dropdown stays in sync with real content.
  const posts = await prisma.post.findMany({ select: { category: true } })
  const used = Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => !!c)))
  const known = await prisma.postCategory.findMany()
  const knownNames = new Set(known.map((c) => c.name))
  const missing = used.filter((c) => !knownNames.has(c))
  if (missing.length > 0) {
    await prisma.postCategory.createMany({
      data: missing.map((name) => ({ name, slug: slugify(name) })),
      skipDuplicates: true,
    })
  }

  const categories = await prisma.postCategory.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ categories })
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    const category = await prisma.postCategory.create({ data: { name, slug: slugify(name) } })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'That category already exists' }, { status: 409 })
  }
}
