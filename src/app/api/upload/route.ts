import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']

/* Every accepted type, paired with the extension we will actually store
   it under and a check on the file's leading bytes.
 *
 * Both halves close a hole that file.type alone left open. file.type is
 * just the Content-Type the uploading client put in the multipart body —
 * it describes what the caller SAYS the file is, and nothing validates
 * that claim, so any payload could be presented as image/png. The
 * signature check reads what the bytes actually are.
 *
 * The extension matters just as much, because the old code kept whatever
 * the original filename ended in. Its sanitiser only replaced characters
 * outside [a-zA-Z0-9.\-_], and "." survives that — so "shell.php",
 * "page.html" and "x.svg" all passed through intact and landed on disk
 * under those names while claiming to be images. Deriving the extension
 * from the validated type instead means a stored file's name can only
 * ever end in one of these nine, whatever it was called on the way in.
 * Dots are also dropped from the base name below, so there is no
 * "x.php.jpg" double-extension left for a misconfigured server in front
 * of this to interpret. */
const sig = (b: Buffer, ...expected: number[]) =>
  b.length >= expected.length && expected.every((v, i) => b[i] === v)
const tag = (b: Buffer, at: number, s: string) =>
  b.length >= at + s.length && b.toString('latin1', at, at + s.length) === s

const FILE_KINDS: Record<string, { ext: string; matches: (b: Buffer) => boolean }> = {
  'image/jpeg':      { ext: '.jpg',  matches: b => sig(b, 0xff, 0xd8, 0xff) },
  'image/png':       { ext: '.png',  matches: b => sig(b, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a) },
  'image/gif':       { ext: '.gif',  matches: b => tag(b, 0, 'GIF87a') || tag(b, 0, 'GIF89a') },
  'image/webp':      { ext: '.webp', matches: b => tag(b, 0, 'RIFF') && tag(b, 8, 'WEBP') },
  // ISO base-media container: the brand at offset 8 varies (avif/avis/
  // mif1), so this checks the 'ftyp' box marker that all of them carry.
  'image/avif':      { ext: '.avif', matches: b => tag(b, 4, 'ftyp') },
  'video/mp4':       { ext: '.mp4',  matches: b => tag(b, 4, 'ftyp') },
  'video/webm':      { ext: '.webm', matches: b => sig(b, 0x1a, 0x45, 0xdf, 0xa3) },
  'video/quicktime': { ext: '.mov',  matches: b => tag(b, 4, 'ftyp') || tag(b, 4, 'moov') || tag(b, 4, 'mdat') },
  'video/ogg':       { ext: '.ogg',  matches: b => tag(b, 0, 'OggS') },
}

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

    const kind = FILE_KINDS[file.type]
    if (!kind) {
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

    // The declared type got us this far; this is where it has to prove
    // itself. Rejecting here means nothing reaches disk unless its own
    // leading bytes agree with what it claimed to be.
    if (!kind.matches(buffer)) {
      return NextResponse.json(
        { error: "File contents don't match its declared type." },
        { status: 400 }
      )
    }

    /* Base name only — the extension is appended from the validated type
       below, never carried over from the caller. path.basename() drops
       any directory part first, so a name like "../../x" cannot walk out
       of the uploads directory; dots go too, so nothing can smuggle in a
       second extension. Capped so a very long name can't produce a path
       the filesystem rejects, and falls back to "upload" for a name that
       sanitises down to nothing. */
    const baseName = path.basename(file.name)
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 80) || 'upload'

    const uniqueName = `${Date.now()}-${baseName}${kind.ext}`

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
        title: baseName,
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
