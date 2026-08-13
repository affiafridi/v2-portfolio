'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, Lock, ShieldAlert } from 'lucide-react'
import { usePageTransitionStore } from '@/store/usePageTransitionStore'

interface AttemptStatus {
  blocked: boolean
  remaining: number
  blockedUntil: string | null
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const startTransition = usePageTransitionStore((s) => s.start)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<AttemptStatus | null>(null)
  const [now, setNow] = useState(Date.now())

  const fetchStatus = async () => {
    const res = await fetch('/api/admin/login-status')
    const data: AttemptStatus = await res.json()
    setStatus(data)
    return data
  }

  useEffect(() => { fetchStatus() }, [])

  useEffect(() => {
    if (!status?.blocked) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [status?.blocked])

  useEffect(() => {
    if (status?.blocked && status.blockedUntil && new Date(status.blockedUntil).getTime() <= now) {
      fetchStatus()
    }
  }, [now, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      const updated = await fetchStatus()
      if (!updated.blocked) {
        setError(
          updated.remaining > 0
            ? `Invalid email or password — ${updated.remaining} attempt${updated.remaining === 1 ? '' : 's'} remaining`
            : 'Invalid email or password'
        )
      }
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  const handleBackToSite = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition()
    setTimeout(() => router.push('/'), 520)
  }

  const isBlocked = status?.blocked ?? false
  const remainingMs = status?.blockedUntil ? new Date(status.blockedUntil).getTime() - now : 0

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#000000] px-4">
      <div className="w-full max-w-[440px] rounded-[28px] bg-white px-8 py-10 sm:px-12 sm:py-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">

        {isBlocked ? (
          <>
            {/* Icon badge — blocked state */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <ShieldAlert className="h-5 w-5 text-amber-600" strokeWidth={1.75} />
            </div>

            <h1 className="mt-5 text-center text-[22px] font-semibold tracking-tight text-neutral-900">
              Too many attempts
            </h1>
            <p className="mx-auto mt-1.5 max-w-[30ch] text-center text-[13px] leading-relaxed text-neutral-500">
              For security, sign-in has been temporarily disabled for this network.
            </p>

            <div className="mt-7 rounded-xl bg-neutral-50 py-4 text-center">
              <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400">
                Try again in
              </div>
              <div className="mt-1 text-[24px] font-semibold tabular-nums tracking-tight text-neutral-900">
                {formatCountdown(remainingMs)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Icon badge */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <Lock className="h-5 w-5 text-neutral-500" strokeWidth={1.75} />
            </div>

            <h1 className="mt-5 text-center text-[22px] font-semibold tracking-tight text-neutral-900">
              Sign in
            </h1>
            <p className="mx-auto mt-1.5 max-w-[26ch] text-center text-[13px] leading-relaxed text-neutral-500">
              Enter your admin credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-neutral-900 outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.06]"
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-11 text-[15px] text-neutral-900 outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.06]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-[13px] font-medium text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-[15px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </button>
            </form>
          </>
        )}

        <a
          href="/"
          onClick={handleBackToSite}
          className="mt-6 block text-center text-[13px] font-medium text-neutral-400 transition hover:text-neutral-600"
        >
          &larr; Back to site
        </a>
      </div>
    </div>
  )
}
