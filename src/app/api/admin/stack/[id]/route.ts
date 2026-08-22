import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    // num is derived from position (see reorder/route.ts and DELETE below),
    // never editable directly — strip it even if an older client sends one.
    delete body.num
    const category = await prisma.stackCategory.update({ where: { id: params.id }, data: body })
    revalidatePath('/')
    return NextResponse.json(category)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update category'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  await prisma.stackCategory.delete({ where: { id: params.id } })

  // Close the gap left in the numbering — e.g. deleting "03" out of
  // 01..08 should leave 01..07, not skip straight from 02 to 04.
  const remaining = await prisma.stackCategory.findMany({ orderBy: { sortOrder: 'asc' } })
  await prisma.$transaction(
    remaining.map((c, index) =>
      prisma.stackCategory.update({
        where: { id: c.id },
        data: { sortOrder: index, num: String(index + 1).padStart(2, '0') },
      })
    )
  )

  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
