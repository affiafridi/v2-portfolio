import { prisma } from '@/lib/prisma'

export const MAX_ATTEMPTS = 3
export const LOCKOUT_MINUTES = 60

export interface AttemptStatus {
  blocked: boolean
  remaining: number
  blockedUntil: Date | null
}

/**
 * Extracts the real client IP from proxy headers. Trusts x-forwarded-for /
 * x-real-ip, which is only safe because the production deploy sits behind
 * nginx, which overwrites (not appends to) these headers with the real
 * connecting IP rather than passing through whatever the client sent.
 */
export function getClientIp(headers: Record<string, unknown> | undefined): string {
  const xff = headers?.['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim()
  }
  const xri = headers?.['x-real-ip']
  if (typeof xri === 'string' && xri.length > 0) {
    return xri.trim()
  }
  return 'unknown'
}

// Fetches the record for an IP, transparently resetting it once a previous
// lockout window has fully expired — so callers never see a stale attempts
// count left over from a lockout that already served its purpose.
async function resolveRecord(ip: string) {
  const record = await prisma.loginAttempt.findUnique({ where: { ip } })
  if (!record) return null

  if (record.blockedUntil && record.blockedUntil <= new Date()) {
    return prisma.loginAttempt.update({
      where: { ip },
      data: { attempts: 0, blockedUntil: null },
    })
  }

  return record
}

export async function getAttemptStatus(ip: string): Promise<AttemptStatus> {
  const record = await resolveRecord(ip)
  if (!record) return { blocked: false, remaining: MAX_ATTEMPTS, blockedUntil: null }

  if (record.blockedUntil) {
    return { blocked: true, remaining: 0, blockedUntil: record.blockedUntil }
  }

  return {
    blocked: false,
    remaining: Math.max(0, MAX_ATTEMPTS - record.attempts),
    blockedUntil: null,
  }
}

export async function recordFailure(ip: string): Promise<AttemptStatus> {
  const record = await resolveRecord(ip)
  const attempts = (record?.attempts ?? 0) + 1

  const blockedUntil = attempts >= MAX_ATTEMPTS
    ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
    : null

  await prisma.loginAttempt.upsert({
    where: { ip },
    create: { ip, attempts, blockedUntil },
    update: { attempts, blockedUntil },
  })

  return {
    blocked: blockedUntil !== null,
    remaining: Math.max(0, MAX_ATTEMPTS - attempts),
    blockedUntil,
  }
}

export async function recordSuccess(ip: string): Promise<void> {
  await prisma.loginAttempt.upsert({
    where: { ip },
    create: { ip, attempts: 0, blockedUntil: null },
    update: { attempts: 0, blockedUntil: null },
  })
}
