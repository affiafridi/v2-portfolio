import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] })
    }
    const entries = fs.readdirSync(UPLOAD_DIR)
    const files = entries
      .filter((f) => !f.startsWith('.'))
      .map((f) => `/uploads/${f}`)
      .reverse()
    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ files: [] })
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  const { file } = await req.json()
  if (!file || typeof file !== 'string') {
    return NextResponse.json({ error: 'File path required' }, { status: 400 })
  }

  const filename = path.basename(file)
  const filePath = path.join(UPLOAD_DIR, filename)

  if (!filePath.startsWith(UPLOAD_DIR)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
