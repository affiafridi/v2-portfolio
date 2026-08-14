import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    if (!body.slug) body.slug = slugify(body.title || '')
    if (body.sortOrder === undefined) body.sortOrder = await prisma.project.count()
    const project = await prisma.project.create({ data: body })
    revalidatePath('/')
    revalidatePath('/work')
    return NextResponse.json(project, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
