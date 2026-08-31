'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { gsap } from 'gsap'
import { Eye, EyeOff, Loader2, Lock, ShieldAlert } from 'lucide-react'
import { usePageTransitionStore } from '@/store/usePageTransitionStore'
import LampSwitch from '@/components/admin/LampSwitch'

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
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  )
}

function AdminLoginForm() {
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

  /* ── Lamp gate ────────────────────────────────────────────────────
     The card is mounted the whole time (so anything typed survives the
     lamp being switched off and on again) but is kept out of the tab
     order via `visibility` while hidden — opacity alone would leave the
     email and password fields focusable behind a dark screen.
     cardMounted lags lampOn on the way out so the fade-out can finish
     before visibility flips. */
  const [lampOn, setLampOn]           = useState(false)
  const [cardMounted, setCardMounted] = useState(false)
  const [reduced, setReduced]         = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    if (lampOn) {
      setCardMounted(true)
      if (reduced) {
        gsap.set(card, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
        gsap.set(card.querySelectorAll('.lg-rise'), { opacity: 1, y: 0 })
        return
      }
      /* Slightly behind the lamp's own flicker so the card reads as
         appearing *because* the light came on, not alongside it. */
      gsap.fromTo(card,
        { opacity: 0, y: 26, scale: 0.965, filter: 'blur(10px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.85, delay: 0.18, ease: 'power3.out' }
      )
      gsap.fromTo(card.querySelectorAll('.lg-rise'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.42, stagger: 0.07, ease: 'power2.out' }
      )
    } else if (cardMounted) {
      gsap.to(card, {
        opacity: 0, y: 16, scale: 0.98, filter: 'blur(8px)',
        duration: reduced ? 0 : 0.32, ease: 'power2.in',
        onComplete: () => setCardMounted(false),
      })
    }
    // cardMounted is intentionally not a dependency — including it would
    // re-run this on the setCardMounted(true) above and restart the
    // entrance animation mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lampOn, reduced])

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

  const statusLoaded = status !== null
  const isBlocked = status?.blocked ?? false
  const remainingMs = status?.blockedUntil ? new Date(status.blockedUntil).getTime() - now : 0

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        /* Top-anchored, not centred: the lamp hangs from the ceiling, so
           the wire has to start at the very top of the viewport. The card
           then follows immediately beneath it rather than being pushed to
           the vertical middle, which was leaving a dead gap between the
           two on every screen size. */
        justifyContent: 'flex-start',
        paddingTop: 'clamp(10px, 3vh, 34px)',
        paddingBottom: 'clamp(24px, 5vh, 56px)',
        position: 'relative',
        overflow: 'hidden',
        background: '#080808',
        /* Warms the whole room a touch once the lamp is lit, so the
           background reacts too rather than the light stopping at the
           edge of the cone. */
        transition: 'background 0.7s ease',
        ...(lampOn ? { background: '#100e0b' } : null),
      }}
    >
      <LampSwitch on={lampOn} onToggle={() => setLampOn(v => !v)} reduced={reduced} />

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          /* Sits just clear of the knob rather than overlapping it — the
             card is above the lamp in z-order, so any overlap would swallow
             the pointer events the cord needs to stay draggable. */
          marginTop: 'clamp(4px, 1.2vh, 16px)',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: '100%',
            maxWidth: 440,
            opacity: 0,
            visibility: cardMounted ? 'visible' : 'hidden',
            willChange: 'transform, opacity, filter',
          }}
        >
          <div className="rounded-[28px] bg-white px-8 py-10 shadow-[0_30px_90px_-20px_rgba(255,190,110,0.22)] sm:px-12 sm:py-12">

            {!statusLoaded ? (
              /* Wait for the blocked/not-blocked check before showing either
                 screen — rendering the sign-in form by default while this
                 loads, then swapping to the blocked screen once it resolves,
                 was a visible flash on every refresh during an active cooldown. */
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
              </div>
            ) : isBlocked ? (
              <>
                {/* Icon badge — blocked state */}
                <div className="lg-rise mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                  <ShieldAlert className="h-5 w-5 text-amber-600" strokeWidth={1.75} />
                </div>

                <h1 className="lg-rise mt-5 text-center text-[22px] font-semibold tracking-tight text-neutral-900">
                  Too many attempts
                </h1>
                <p className="lg-rise mx-auto mt-1.5 max-w-[30ch] text-center text-[13px] leading-relaxed text-neutral-500">
                  For security, sign-in has been temporarily disabled for this network.
                </p>

                <div className="lg-rise mt-7 rounded-xl bg-neutral-50 py-4 text-center">
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
                <div className="lg-rise mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                  <Lock className="h-5 w-5 text-neutral-500" strokeWidth={1.75} />
                </div>

                <h1 className="lg-rise mt-5 text-center text-[22px] font-semibold tracking-tight text-neutral-900">
                  Sign in
                </h1>
                <p className="lg-rise mx-auto mt-1.5 max-w-[26ch] text-center text-[13px] leading-relaxed text-neutral-500">
                  Enter your admin credentials to continue
                </p>

                <form onSubmit={handleSubmit} className="mt-8">
                  <div className="lg-rise">
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

                  <div className="lg-rise mt-4">
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
                    className="lg-rise mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-[15px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                  </button>
                </form>
              </>
            )}

            <a
              href="/"
              onClick={handleBackToSite}
              className="lg-rise mt-6 block text-center text-[13px] font-medium text-neutral-400 transition hover:text-neutral-600"
            >
              &larr; Back to site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
