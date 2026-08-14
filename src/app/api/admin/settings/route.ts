import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  return NextResponse.json(settings?.data || {})
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: { data: body },
      create: { id: 'singleton', data: body },
    })
    // Settings affect nearly every route (home, work/services/blog index
    // pages, SEO defaults on every detail page, footer everywhere) — revalidate
    // the whole tree under the root layout, not just "/".
    revalidatePath('/', 'layout')
    return NextResponse.json(settings.data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
