import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const items = await prisma.stackItem.findMany({
    where: { categoryId: params.id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    if (body.sortOrder === undefined) {
      body.sortOrder = await prisma.stackItem.count({ where: { categoryId: params.id } })
    }
    const item = await prisma.stackItem.create({ data: { ...body, categoryId: params.id } })
    revalidatePath('/')
    return NextResponse.json(item, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create item'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
