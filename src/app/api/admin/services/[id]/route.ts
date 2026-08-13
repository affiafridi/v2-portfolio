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
  revalidatePath('/')
  revalidatePath('/services')
  return NextResponse.json({ ok: true })
}
