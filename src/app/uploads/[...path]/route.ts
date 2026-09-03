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
  const known = Object.prototype.hasOwnProperty.call(CONTENT_TYPES, ext)
  const contentType = known ? CONTENT_TYPES[ext] : 'application/octet-stream'

  // Uploaded filenames are timestamp-prefixed and never rewritten in
  // place (editing uploads a new file under a new name) — that makes
  // them content-addressed in effect, safe to cache for a long time.
  // Matches the intent of the equivalent rule in next.config.js, set
  // explicitly here since this is a route handler response, not a
  // static file Next applies that config rule to automatically.
  /* This directory is the one place on the site whose contents came from
     an upload rather than from the codebase, so its responses say
     explicitly how they may be treated instead of relying on the global
     rules in next.config.js.
       nosniff  — without it a browser may disregard the Content-Type and
                  guess from the bytes, which is exactly how a file served
                  as application/octet-stream ends up being rendered as
                  HTML on this origin.
       attachment for anything whose extension is not one of the nine
                  media types above — it gets downloaded, never rendered
                  in a tab that would share this site's origin. Uploads
                  can no longer be created under any other extension (see
                  the upload route), but files written before that fix
                  kept whatever extension their original filename had, so
                  this covers what is already sitting on disk. Known media
                  types are untouched and still render inline as before. */
  const baseHeaders: Record<string, string> = {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
    'X-Content-Type-Options': 'nosniff',
    ...(known ? {} : { 'Content-Disposition': 'attachment' }),
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
