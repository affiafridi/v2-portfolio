import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  try {
    const body = await request.json()
    const data: Record<string, boolean> = {}
    if (typeof body.read === 'boolean') data.read = body.read
    if (typeof body.archived === 'boolean') data.archived = body.archived
    const submission = await prisma.contactSubmission.update({ where: { id: params.id }, data })
    return NextResponse.json(submission)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update submission'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  await prisma.contactSubmission.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
