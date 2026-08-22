import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const categories = await prisma.stackCategory.findMany({
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    // num is derived from position, never client-supplied — see reorder/
    // and [id]/route.ts (DELETE), which keep it in sync the same way.
    const sortOrder = body.sortOrder ?? await prisma.stackCategory.count()
    const category = await prisma.stackCategory.create({
      data: { ...body, sortOrder, num: String(sortOrder + 1).padStart(2, '0') },
    })
    revalidatePath('/')
    return NextResponse.json(category, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create category'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
