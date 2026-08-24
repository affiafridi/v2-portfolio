import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/* Module-scope, not per-request — middleware runs on every navigation,
   and hitting the DB just to read a boolean that changes maybe once a
   month would be wasteful. Now only non-admin requests ever reach this
   (see the token-first ordering below), so the only cost of a longer TTL
   is public visitors occasionally seeing stale maintenance state for up
   to a minute after an admin flips the toggle — a non-issue for
   something toggled this rarely and deliberately. */
let maintenanceCache = { value: false, checkedAt: 0 }
const MAINTENANCE_TTL_MS = 60_000

async function isMaintenanceOn(request: NextRequest) {
  const now = Date.now()
  if (now - maintenanceCache.checkedAt < MAINTENANCE_TTL_MS) return maintenanceCache.value
  try {
    const res = await fetch(new URL('/api/maintenance-status', request.url), { cache: 'no-store' })
    const data = await res.json()
    maintenanceCache = { value: !!data.maintenanceMode, checkedAt: now }
  } catch {
    // DB/network hiccup — keep serving the last known value rather than
    // either locking everyone out or exposing the site on a failed check.
  }
  return maintenanceCache.value
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
