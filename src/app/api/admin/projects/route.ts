import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    if (!body.slug) body.slug = slugify(body.title || '')
    // An empty slug isn't just cosmetically wrong — it collides with the
    // listing page's own path during static export and fails the whole
    // production build (real incident: generateStaticParams() emitted a
    // {slug: ''} param, which "next build" rejected outright). Only
    // reachable if title was ALSO empty (the form's own required
    // attribute stops that path, but that's client-side only).
    if (!body.slug) {
      return NextResponse.json({ error: 'Title or slug is required' }, { status: 400 })
    }
    if (body.sortOrder === undefined) body.sortOrder = await prisma.project.count()
    const project = await prisma.project.create({ data: body })
    revalidatePath('/')
    revalidatePath('/work')
    return NextResponse.json(project, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
