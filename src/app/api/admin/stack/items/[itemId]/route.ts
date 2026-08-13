import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PUT(request: Request, { params }: { params: { itemId: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    const item = await prisma.stackItem.update({ where: { id: params.itemId }, data: body })
    revalidatePath('/')
    return NextResponse.json(item)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update item'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { itemId: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  await prisma.stackItem.delete({ where: { id: params.itemId } })
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
