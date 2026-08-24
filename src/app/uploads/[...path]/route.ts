import { NextResponse } from 'next/server'
import { stat } from 'fs/promises'
import { createReadStream } from 'fs'
import { Readable } from 'stream'
import path from 'path'

/* Serves user-uploaded files from a directory OUTSIDE public/, reading
   fresh from disk on every request — see UPLOAD_DIR in
   src/app/api/upload/route.ts for why this exists: Next's own static
   serving for files added to public/ after the server process started
   was returning 404 until the next restart (confirmed empirically —
   restarting PM2 immediately fixed an otherwise-permanently-broken
   upload), so every new upload needed a manual restart to become
   visible. This route has no such dependency; it stats and streams
   the file directly, so it works immediately regardless of when the
   file was written relative to server startup. */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.ogg': 'video/ogg',
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  // path.join collapses any ".." segments, but a request could still smuggle
  // one in as a single encoded segment — resolve and verify the final path
  // is actually inside UPLOAD_DIR before touching the filesystem at all.
  const filename = params.path.join('/')
  const filePath = path.join(UPLOAD_DIR, filename)
  if (!filePath.startsWith(UPLOAD_DIR + path.sep) && filePath !== UPLOAD_DIR) {
    return new NextResponse('Not found', { status: 404 })
  }

  let stats
  try {
    stats = await stat(filePath)
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
  if (!stats.isFile()) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

  // Uploaded filenames are timestamp-prefixed and never rewritten in
  // place (editing uploads a new file under a new name) — that makes
  // them content-addressed in effect, safe to cache for a long time.
  // Matches the intent of the equivalent rule in next.config.js, set
  // explicitly here since this is a route handler response, not a
  // static file Next applies that config rule to automatically.
  const baseHeaders = {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
  }

  const range = request.headers.get('range')
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0
      const end = match[2] ? parseInt(match[2], 10) : stats.size - 1
      if (start <= end && end < stats.size) {
        const stream = createReadStream(filePath, { start, end })
        return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
          status: 206,
          headers: {
            ...baseHeaders,
            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
            'Content-Length': String(end - start + 1),
          },
        })
      }
    }
  }

  const stream = createReadStream(filePath)
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: {
      ...baseHeaders,
      'Content-Length': String(stats.size),
    },
  })
}
