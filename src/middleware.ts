import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/* Module-scope, not per-request — middleware runs on every navigation,
   and hitting the DB just to read a boolean that changes maybe once a
   month would be wasteful. Now only non-admin requests ever reach this
   (see the token-first ordering below), so the only cost of a longer TTL
   is public visitors occasionally seeing stale maintenance state for up
   to a minute after an admin flips the toggle — a non-issue for
   something toggled this rarely and deliberately.

   value starts null, not false — see the "never successfully checked"
   branch in isMaintenanceOn() below for why that distinction matters. */
let maintenanceCache: { value: boolean | null; checkedAt: number } = { value: null, checkedAt: 0 }
const MAINTENANCE_TTL_MS = 60_000

/* Tries a direct loopback request first, falling back to the original
   request-relative URL only if that fails. The original approach — the
   only one this ever had — builds the URL from the incoming request's
   own Host header, meaning middleware calls back out through whatever
   sits in front of it (Cloudflare, nginx) to reach itself. That's an
   extra round trip through infrastructure that has no obligation to
   loop a request back to its own origin cleanly, and is a plausible
   reason this failed silently in production while working in every
   local test here (next start with no proxy in front). A loopback
   request to the same process never leaves the machine, so it can't be
   affected by any of that. process.env.PORT is what `next start -p
   PORT` sets for exactly this kind of same-process call; falling back
   to the request-relative URL keeps this working even if that's ever
   unset for some reason, rather than guessing at a hardcoded port. */
async function fetchMaintenanceStatus(request: NextRequest): Promise<boolean | null> {
  const candidates = [
    process.env.PORT ? `http://127.0.0.1:${process.env.PORT}/api/maintenance-status` : null,
    new URL('/api/maintenance-status', request.url).toString(),
  ].filter((u): u is string => u !== null)

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) continue
      const data = await res.json()
      return !!data.maintenanceMode
    } catch {
      // try the next candidate
    }
  }
  return null
}

async function isMaintenanceOn(request: NextRequest): Promise<boolean> {
  const now = Date.now()
  if (maintenanceCache.value !== null && now - maintenanceCache.checkedAt < MAINTENANCE_TTL_MS) {
    return maintenanceCache.value
  }

  const result = await fetchMaintenanceStatus(request)
  if (result !== null) {
    maintenanceCache = { value: result, checkedAt: now }
    return result
  }

  /* Every candidate URL failed. If a previous check ever succeeded,
     trust that over guessing — a single blip shouldn't flip the whole
     site's visibility. But if this is the very first check (fresh
     process, or every attempt has failed since boot), there IS no last-
     known value to fall back to — and defaulting that unknown state to
     "not in maintenance" is exactly the bug just reported: a maintenance
     flag that's on in the database but silently fails open, showing the
     real site to every visitor. Defaulting unknown to "in maintenance"
     instead means the failure mode is a few early visitors briefly
     seeing the maintenance page even when it's really off — self-
     correcting the moment any check succeeds — instead of the reverse. */
  return maintenanceCache.value ?? true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    const token = await getToken({ req: request })
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request })
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  /* Maintenance gating lives here, before Next decides how to render the
     page — not as a cookie/session read inside the root layout (that was
     the previous approach). Any dynamic API call in a layout forces every
     route beneath it into per-request rendering, and routes built via
     generateStaticParams() (the services/work/blog detail pages) don't
     degrade gracefully from that: they throw DYNAMIC_SERVER_USAGE instead
     of falling back, which is what was producing the 500 on the service
     page whenever maintenance mode was on. Checking here, ahead of
     rendering entirely, can't taint page generation at all.

     getToken() first, not isMaintenanceOn() first — getToken() is a local
     JWT decode (no network), while a cache-cold isMaintenanceOn() is a
     real fetch + DB round trip (measured ~300ms locally). The admin
     bypasses maintenance mode regardless of its value, so checking token
     first means an admin's own navigation never pays that cost at all —
     previously it ran isMaintenanceOn() unconditionally and only checked
     the token afterward, so every logged-in navigation was paying for a
     DB query whose result got thrown away as soon as the token check
     passed. That was landing as real, visible page-transition lag. */
  if (pathname !== '/maintenance') {
    const token = await getToken({ req: request })
    if (!token && (await isMaintenanceOn(request))) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|uploads|_next/static|_next/image|.*\\..*).*)'],
}
