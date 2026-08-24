import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, AVIF, MP4, WebM, MOV, OGG.' },
        { status: 400 }
      )
    }

    const isVideo = VIDEO_TYPES.includes(file.type)
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename: remove non-alphanumeric chars except dots and hyphens
    const sanitized = file.name
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')

    const uniqueName = `${Date.now()}-${sanitized}`

    // Deliberately NOT public/uploads — Next's own static serving for
    // public/ only reliably picks up files that existed when the server
    // process started; anything written here after boot 404s until the
    // next restart (confirmed: a live upload was broken until a manual
    // PM2 restart, then worked). This directory is served instead by
    // src/app/uploads/[...path]/route.ts, which reads fresh from disk
    // on every request and has no such staleness.
    const uploadsDir = path.join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const filePath = path.join(uploadsDir, uniqueName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${uniqueName}`

    // Every upload — regardless of which form triggered it — lands in the
    // central media library automatically.
    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        filename: uniqueName,
        type: isVideo ? 'video' : 'image',
        title: sanitized.replace(/\.[^.]+$/, ''),
        size: buffer.length,
      },
    })

    return NextResponse.json({ url, asset })
  } catch {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
