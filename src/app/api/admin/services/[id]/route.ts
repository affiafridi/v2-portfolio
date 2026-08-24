import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const service = await prisma.service.findUnique({ where: { id: params.id } })
  if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(service)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    // Same guard as create — an empty slug breaks static export for the
    // whole site, not just this service (see services/route.ts POST).
    // This exact gap is how "Web Apps Development" ended up with
    // slug: '' in production and broke the build.
    if (typeof body.slug === 'string' && body.slug.trim() === '') {
      return NextResponse.json({ error: 'Slug cannot be empty' }, { status: 400 })
    }
    // num is derived from position (see reorder/route.ts and DELETE
    // below), never editable directly — strip it even if an older
    // client sends one.
    delete body.num
    const service = await prisma.service.update({ where: { id: params.id }, data: body })
    revalidatePath('/')
    revalidatePath('/services')
    revalidatePath(`/services/${service.slug}`)
    return NextResponse.json(service)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update service'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  await prisma.service.delete({ where: { id: params.id } })

  // Close the gap left in the numbering — e.g. deleting "03" out of
  // 01..08 should leave 01..07, not skip straight from 02 to 04.
  const remaining = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })
  await prisma.$transaction(
    remaining.map((s, index) =>
      prisma.service.update({
        where: { id: s.id },
        data: { sortOrder: index, num: String(index + 1).padStart(2, '0') },
      })
    )
  )

  revalidatePath('/')
  revalidatePath('/services')
  return NextResponse.json({ ok: true })
}
