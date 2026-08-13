import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, getAttemptStatus } from '@/lib/loginAttempts'

// Public — no auth required. Used by the login page (pre-authentication)
// to know whether the requester's own IP is currently rate-limited.
export async function GET(req: NextRequest) {
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => { headers[key] = value })

  const ip = getClientIp(headers)
  const status = await getAttemptStatus(ip)

  return NextResponse.json(status)
}
