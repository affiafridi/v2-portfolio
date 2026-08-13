import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized
  const { searchParams } = new URL(request.url)
  const archived = searchParams.get('archived')
  const read = searchParams.get('read')

  const where: Record<string, boolean> = {}
  if (archived !== null) where.archived = archived === 'true'
  if (read !== null) where.read = read === 'true'

  const submissions = await prisma.contactSubmission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(submissions)
}
