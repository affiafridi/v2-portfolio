import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIp } from '@/lib/loginAttempts'

const MAX_SUBMISSIONS = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

// In-memory sliding-window counter — fine for spam deterrence (resets on
// deploy/restart), unlike the persisted login lockout which is a real
// security control and needs to survive restarts.
const submissionCounts = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = submissionCounts.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    submissionCounts.set(ip, { count: 1, windowStart: now })
    return false
  }

  entry.count += 1
  return entry.count > MAX_SUBMISSIONS
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const ip = getClientIp(Object.fromEntries(request.headers.entries()))
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const interests = Array.isArray(body.interests)
      ? body.interests.filter((i: unknown): i is string => typeof i === 'string').slice(0, 20).map((i: string) => i.slice(0, 100))
      : []

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (name.length > 200 || email.length > 200 || phone.length > 50) {
      return NextResponse.json({ error: 'One or more fields are too long' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 characters)' }, { status: 400 })
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        message,
        phone: phone || null,
        interests,
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
