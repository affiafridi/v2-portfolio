import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const { ids } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'ids must be a non-empty array of strings' }, { status: 400 })
    }

    const assets = await prisma.mediaAsset.findMany({ where: { id: { in: ids } } })

    await prisma.mediaAsset.deleteMany({ where: { id: { in: ids } } })

    for (const asset of assets) {
      const filePath = path.join(UPLOAD_DIR, path.basename(asset.filename))
      if (filePath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    return NextResponse.json({ ok: true, deleted: assets.length })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to delete media'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
