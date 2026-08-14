import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { ids } = await request.json()
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'ids must be an array of strings' }, { status: 400 })
    }

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.stackItem.update({ where: { id }, data: { sortOrder: index } })
      )
    )

    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to reorder items'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
