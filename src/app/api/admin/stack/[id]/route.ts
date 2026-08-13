import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
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
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
