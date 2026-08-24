import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    // Same guard as create — an empty slug breaks static export for the
    // whole site, not just this project (see projects/route.ts POST).
    if (typeof body.slug === 'string' && body.slug.trim() === '') {
      return NextResponse.json({ error: 'Slug cannot be empty' }, { status: 400 })
    }
    const project = await prisma.project.update({ where: { id: params.id }, data: body })
    revalidatePath('/')
    revalidatePath('/work')
    revalidatePath(`/work/${project.slug}`)
    return NextResponse.json(project)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  await prisma.project.delete({ where: { id: params.id } })
  revalidatePath('/')
  revalidatePath('/work')
  return NextResponse.json({ ok: true })
}
