import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/slugify'
import { friendlyPrismaError } from '@/lib/prisma-errors'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(services)
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
    // num is derived from position, never client-supplied — see reorder/
    // and [id]/route.ts (DELETE), which keep it in sync the same way.
    const sortOrder = body.sortOrder ?? await prisma.service.count()
    const service = await prisma.service.create({
      data: { ...body, sortOrder, num: String(sortOrder + 1).padStart(2, '0') },
    })
    revalidatePath('/')
    revalidatePath('/services')
    return NextResponse.json(service, { status: 201 })
  } catch (e: unknown) {
    const { message, status } = friendlyPrismaError(e, 'Failed to create service')
    return NextResponse.json({ error: message }, { status })
  }
}
