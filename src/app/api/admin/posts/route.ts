import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    if (!body.slug) body.slug = slugify(body.title || '')
    const post = await prisma.post.create({ data: body })
    revalidatePath('/blog')
    return NextResponse.json(post, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
