import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  // Backfill any type values already used on projects but not yet tracked
  // as a proper ProjectType, so the dropdown stays in sync with real content.
  const projects = await prisma.project.findMany({ select: { type: true } })
  const used = Array.from(new Set(projects.map((p) => p.type).filter((t): t is string => !!t)))
  const known = await prisma.projectType.findMany()
  const knownNames = new Set(known.map((t) => t.name))
  const missing = used.filter((t) => !knownNames.has(t))
  if (missing.length > 0) {
    await prisma.projectType.createMany({
      data: missing.map((name) => ({ name, slug: slugify(name) })),
      skipDuplicates: true,
    })
  }

  const types = await prisma.projectType.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ types })
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
    const type = await prisma.projectType.create({ data: { name, slug: slugify(name) } })
    return NextResponse.json(type)
  } catch {
    return NextResponse.json({ error: 'That type already exists' }, { status: 409 })
  }
}
