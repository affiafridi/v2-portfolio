import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const data: Record<string, string> = {}
    if (typeof body.alt === 'string') data.alt = body.alt
    if (typeof body.title === 'string') data.title = body.title

    const asset = await prisma.mediaAsset.update({ where: { id: params.id }, data })
    return NextResponse.json(asset)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update media'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const asset = await prisma.mediaAsset.delete({ where: { id: params.id } })

    // path.basename strips any directory traversal before joining, so this
    // can't escape UPLOAD_DIR even if `filename` were ever malformed.
    const filePath = path.join(UPLOAD_DIR, path.basename(asset.filename))
    if (filePath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to delete media'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
