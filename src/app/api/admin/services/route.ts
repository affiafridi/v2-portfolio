import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/slugify'

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
    const service = await prisma.service.create({ data: body })
    revalidatePath('/')
    revalidatePath('/services')
    return NextResponse.json(service, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create service'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
