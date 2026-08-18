'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { useContactStore } from '@/store/useContactStore'
import { useCursorStore }  from '@/store/useCursorStore'

/* ─── URL sync hook — pushes /contact on open, restores on close ─── */
function useContactUrl(isOpen: boolean, close: () => void) {
  const prevPathRef    = useRef('/')
  const usedPushState  = useRef(false)
  const savedScrollRef = useRef(0)
  const router         = useRouter()

  useEffect(() => {
    if (isOpen) {
      /* Save scroll position before the modal covers the page */
      savedScrollRef.current = window.scrollY

      if (window.location.pathname !== '/contact') {
        prevPathRef.current   = window.location.pathname
        usedPushState.current = true
        window.history.pushState({ contactModal: true }, '', '/contact')
      } else {
        usedPushState.current = false
        prevPathRef.current   = '/'
      }
    } else {
      if (window.location.pathname === '/contact') {
        if (usedPushState.current) {
          window.history.pushState({}, '', prevPathRef.current)
        } else {
          router.back()
        }
      }

      /* Restore scroll position after modal closes.
         Use rAF so Lenis has resumed before we set position. */
      const saved = savedScrollRef.current
      requestAnimationFrame(() => {
        const lenis = (window as unknown as Record<string, unknown>).__lenis as
          | { scrollTo: (target: number, opts: Record<string, unknown>) => void }
          | undefined
        if (lenis) {
          lenis.scrollTo(saved, { immediate: true })
        } else {
          window.scrollTo(0, saved)
        }
      })
    }
  }, [isOpen, router])

  /* Handle browser back button while modal is open */
  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname !== '/contact') close()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [close])
}

/* ─── Tokens ─────────────────────────────────────────────────────── */
const BG  = 'rgba(240,238,234,0.72)'
const INK = '#1a1a1a'
const ACC = '#ff4d00'

/* ─── Interest tags ──────────────────────────────────────────────── */
const INTERESTS = [
  'Web Development',
  'UI/UX Design',
  'E-commerce',
  'CMS Integration',
  'Motion Design',
  'Full Package',
]

/* ─────────────────────────────────────────────────────────────────
   ContactModal
   ─────────────────────────────────────────────────────────────────
   Full-screen panel that slides in from the top using the same
   clipPath technique as MenuOverlay — respects the site's branding.

   Animation:
     Open  → clipPath inset bottom 100% → 0%  (unrolls downward)
     Close → content fades, panel snaps back up

   Form fields: Name · Email · Phone · Interest (tags) · Message
   ───────────────────────────────────────────────────────────────── */
export default function ContactModal() {
  const { isOpen, close } = useContactStore()
  const { setCursorType } = useCursorStore()

  useContactUrl(isOpen, close)

  const panelRef = useRef<HTMLDivElement>(null)
  const tlRef    = useRef<gsap.core.Timeline | null>(null)

  const [form, setForm] = useState({
    name:      '',
    email:     '',
    phone:     '',
    message:   '',
    interests: [] as string[],
    agreed:    false,
  })
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')

  const toggleInterest = (tag: string) =>
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter(t => t !== tag)
        : [...prev.interests, tag],
    }))

  /* ── Lock scroll (Lenis-aware) ────────────────────────────────── */
  useEffect(() => {
    const lenis = (window as unknown as Record<string, unknown>).__lenis as
      | { stop: () => void; start: () => void }
      | undefined

    if (isOpen) {
      lenis ? lenis.stop() : (document.body.style.overflow = 'hidden')
    } else {
      lenis ? lenis.start() : (document.body.style.overflow = '')
    }

    return () => {
      lenis ? lenis.start() : (document.body.style.overflow = '')
    }
  }, [isOpen])

  /* ── GSAP animation ───────────────────────────────────────────── */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    tlRef.current?.kill()

    if (isOpen) {
      gsap.set(panel, { clearProps: 'opacity' })
      gsap.set(['.cm-line1', '.cm-line2', '.cm-field', '.cm-tags', '.cm-bottom'], {
        clearProps: 'opacity,y,x,scale,filter',
      })

      const tl = gsap.timeline()
      tlRef.current = tl

      tl.fromTo(panel,
          { clipPath: 'inset(0% 0% 100% 0% round 0px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.75, ease: 'expo.inOut' }
        )
        .from('.cm-line1',
          { y: -32, opacity: 0, duration: 0.55, ease: 'power3.out' },
          '-=0.30'
        )
        .from('.cm-line2',
          { y: -24, opacity: 0, duration: 0.50, ease: 'power3.out' },
          '-=0.40'
        )
        .fromTo('.cm-field',
          { opacity: 0, filter: 'blur(10px)', x: 8 },
          { opacity: 1, filter: 'blur(0px)',  x: 0,
            duration: 0.42, ease: 'power2.out', stagger: 0.07 },
          '-=0.28'
        )
        .from('.cm-bottom',
          { y: 16, opacity: 0, duration: 0.40, ease: 'power3.out' },
          '-=0.15'
        )
    } else {
      const tl = gsap.timeline()
      tlRef.current = tl

      tl
        /* 1 — Content all rushes toward close button, staggered bottom → top */
        .to(['.cm-bottom', '.cm-field', '.cm-line2', '.cm-line1'], {
          x:               '22vw',
          y:               '-18vh',
          scale:           0.1,
          opacity:         0,
          filter:          'blur(16px)',
          duration:        0.50,
          ease:            'expo.in',
          stagger:         { each: 0.045, from: 'start' },
          transformOrigin: 'top right',
        })

        /* 2 — Panel collapses directly into a pill at the close button */
        .to(panel, {
          clipPath: 'inset(1.4rem 1.8rem calc(100% - 3.8rem) calc(100% - 8rem) round 100px)',
          duration: 0.65,
          ease:     'expo.inOut',
        }, '-=0.45')

        /* 3 — Pill pinches to a dot and winks out */
        .to(panel, {
          clipPath: 'inset(1.8rem 2.4rem calc(100% - 2.8rem) calc(100% - 3.4rem) round 100px)',
          opacity:  0,
          duration: 0.18,
          ease:     'power3.in',
        })
    }
  }, [isOpen])

  const LABEL: React.CSSProperties = {
    fontSize:      '10px',
    fontWeight:    700,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
    color:         `${INK}38`,
    paddingTop:    '4px',
    flexShrink:    0,
    width:         '110px',
  }

  const INPUT: React.CSSProperties = {
    fontSize:    'clamp(18px, 2.2vw, 30px)',
    fontWeight:  700,
    letterSpacing: '-0.02em',
    color:       INK,
    background:  'none',
    border:      'none',
    outline:     'none',
    width:       '100%',
    fontFamily:  'inherit',
    caretColor:  ACC,
  }

  return (
    <>
    <div
      ref={panelRef}
      className="cm-panel"
      /* This panel scrolls natively (overflowY:auto below), not
         through Lenis — but Lenis's own touch/wheel listeners are
         global and hijack the gesture before it ever reaches this
         element's native scroll, even while lenis.stop() has it
         paused (stop() freezes Lenis's own animation, it doesn't
         release the gesture back to the browser). On mobile, with a
         tall form, that silently made the bottom of the form —
         Send button included — unreachable: swiping down did
         nothing. data-lenis-prevent exempts this element from that
         interception so the browser's native scroll handles it. */
      data-lenis-prevent
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9500,
        background:           'rgba(240,238,234,0.50)',
        backdropFilter:       'blur(48px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(48px) saturate(1.6)',
        clipPath:             'inset(0% 0% 100% 0% round 0px)',
        overflowY:      'auto',
        display:        'flex',
        flexDirection:  'column',
        scrollbarWidth: 'none',
      }}
    >
      {/* ── Close button ─────────────────────────────────────────── */}
      <button
        onClick={close}
        className="cm-close"
        style={{
          position:      'fixed',
          /* env(safe-area-inset-*) pads out from the notch/status-bar
             on devices that have one — without it, a plain rem offset
             can land the button flush against (or under) the status
             bar area since it doesn't know that space exists. */
          top:           'calc(env(safe-area-inset-top, 0px) + clamp(14px, 3.5vw, 1.8rem))',
          right:         'calc(env(safe-area-inset-right, 0px) + clamp(16px, 4.5vw, 2.5rem))',
          zIndex:        9600,
          fontSize:      '11px',
          fontWeight:    700,
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          color:         `${INK}50`,
          background:    'none',
          border:        'none',
          cursor:        'none',
          display:       'flex',
          alignItems:    'center',
          gap:           '8px',
          transition:    'color 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = INK; setCursorType('hover') }}
        onMouseLeave={e => { e.currentTarget.style.color = `${INK}50`; setCursorType('default') }}
      >
        Close
        <span
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:           '24px',
            height:          '24px',
            borderRadius:    '50%',
            border:          `1px solid ${INK}22`,
            fontSize:        '14px',
          }}
        >
          ×
        </span>
      </button>

      <div className="cm-content" style={{
        padding:       'clamp(60px,7vw,100px) clamp(32px,6.5vw,96px) clamp(40px,5vw,64px)',
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        maxWidth:      '1400px',
        width:         '100%',
        margin:        '0 auto',
      }}>

        {/* ── Heading ────────────────────────────────────────────── */}
        <div className="cm-heading" style={{ marginBottom: 'clamp(36px,5vw,64px)' }}>

          {/* Line 1 */}
          <div
            className="cm-line1"
            style={{
              fontSize:      'clamp(52px, 9.5vw, 148px)',
              fontWeight:    800,
              letterSpacing: '-0.04em',
              lineHeight:    0.88,
              color:         INK,
              userSelect:    'none',
            }}
          >
            Let&apos;s work
          </div>

          {/* Line 2 — "together" with inline portrait */}
          <div
            className="cm-line2"
            style={{
              fontSize:      'clamp(52px, 9.5vw, 148px)',
              fontWeight:    800,
              letterSpacing: '-0.04em',
              lineHeight:    0.88,
              color:         INK,
              userSelect:    'none',
              display:       'flex',
              alignItems:    'center',
              gap:           '0.18em',
              flexWrap:      'wrap',
            }}
          >
            {/* Inline portrait */}
            <span
              style={{
                display:      'inline-block',
                width:        'clamp(78px, 11vw, 146px)',
                height:       'clamp(60px, 8.5vw, 112px)',
                borderRadius: '10px',
                overflow:     'hidden',
                verticalAlign: 'middle',
                flexShrink:   0,
                position:     'relative',
                marginRight:  '0.04em',
              }}
            >
              <Image
                src="/uploads/1786796888930-lets-connect.gif"
                alt=""
                fill
                unoptimized
                sizes="146px"
                className="object-cover object-center"
              />
            </span>
            {/* "together" and the dot are wrapped in one flex item so
                .cm-line2's own gap:0.18em (meant for the space after
                the portrait image) doesn't also land here, pushing the
                dot away from the text. display:inline-flex with
                alignItems:flex-end instead of relying on the dot's
                default vertical-align:baseline — this heading's
                lineHeight:0.88 (deliberately tight for the display
                type) compresses the line box below the font's natural
                height, which throws off baseline-relative alignment by
                tens of pixels; aligning to the flex container's own
                bottom edge instead sits right where the text visually
                ends, regardless of that font-metric quirk. */}
            <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
              together
              {/* A literal "." glyph at this weight/size renders as a
                  blocky square, not a dot — a real circle span reads
                  as the same round "stop" used elsewhere (footer
                  big-name dot, hero availability dot), not a font-
                  dependent shape. */}
              <span
                aria-hidden
                style={{
                  display:      'inline-block',
                  width:        '0.14em',
                  height:       '0.14em',
                  borderRadius: '50%',
                  background:   ACC,
                  marginLeft:   '0.05em',
                  marginBottom: '0.06em',
                }}
              />
            </span>
          </div>
        </div>

        {/* ── Form ───────────────────────────────────────────────── */}
        <form
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          onSubmit={async e => {
            e.preventDefault()
            if (!form.name || !form.email || !form.message || submitting) return
            setSubmitError('')
            setSubmitting(true)
            try {
              const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, message: form.message, interests: form.interests }),
              })
              if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setSubmitError(data.error || 'Something went wrong — please try again.')
                return
              }
              setForm({ name: '', email: '', phone: '', message: '', interests: [], agreed: false })
              close()
            } catch {
              setSubmitError('Network error — please check your connection and try again.')
            } finally {
              setSubmitting(false)
            }
          }}
        >

          {/* Name */}
          <div className="cm-field" style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: `1px solid ${INK}12`, padding: 'clamp(12px,1.6vw,20px) 0' }}>
            <span style={LABEL} className="cm-label cm-required">Name</span>
            <input
              type="text" placeholder="Your full name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={INPUT}
              onFocus={() => setCursorType('text')}
              onBlur={()  => setCursorType('default')}
            />
          </div>

          {/* Email */}
          <div className="cm-field" style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: `1px solid ${INK}12`, padding: 'clamp(12px,1.6vw,20px) 0' }}>
            <span style={LABEL} className="cm-label cm-required">Email</span>
            <input
              type="email" placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={INPUT}
              onFocus={() => setCursorType('text')}
              onBlur={()  => setCursorType('default')}
            />
          </div>

          {/* Phone */}
          <div className="cm-field" style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: `1px solid ${INK}12`, padding: 'clamp(12px,1.6vw,20px) 0' }}>
            <span style={LABEL} className="cm-label">Phone</span>
            <input
              type="tel" placeholder="+971 XX XXX XXXX"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              style={INPUT}
              onFocus={() => setCursorType('text')}
              onBlur={()  => setCursorType('default')}
            />
          </div>

          {/* Interest tags */}
          <div className="cm-field cm-tags" style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', borderBottom: `1px solid ${INK}12`, padding: 'clamp(12px,1.6vw,20px) 0' }}>
            <span style={{ ...LABEL, paddingTop: '6px' }} className="cm-label">Interest</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {INTERESTS.map(tag => {
                const active = form.interests.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    className="cm-tag-btn"
                    onClick={() => toggleInterest(tag)}
                    style={{
                      fontSize:      '11px',
                      fontWeight:    600,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      padding:       '8px 18px',
                      borderRadius:  '100px',
                      border:        `1.5px solid ${active ? ACC : `${INK}20`}`,
                      background:    active ? ACC : 'transparent',
                      color:         active ? '#fff' : `${INK}55`,
                      cursor:        'none',
                      transition:    'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      if (!active) { e.currentTarget.style.borderColor = `${INK}50`; e.currentTarget.style.color = INK }
                      setCursorType('hover')
                    }}
                    onMouseLeave={e => {
                      if (!active) { e.currentTarget.style.borderColor = `${INK}20`; e.currentTarget.style.color = `${INK}55` }
                      setCursorType('default')
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <div className="cm-field" style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', borderBottom: `1px solid ${INK}12`, padding: 'clamp(12px,1.6vw,20px) 0' }}>
            <span style={{ ...LABEL, paddingTop: '8px' }} className="cm-label cm-required">Message</span>
            <textarea
              placeholder="Project brief, timeline, budget…"
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              rows={3}
              style={{ ...INPUT, resize: 'none', lineHeight: 1.4 }}
              onFocus={() => setCursorType('text')}
              onBlur={()  => setCursorType('default')}
            />
          </div>

          {submitError && (
            <p style={{
              color:         '#dc2626',
              fontSize:      '12px',
              fontWeight:    600,
              marginTop:     'clamp(12px, 1.6vw, 20px)',
              marginBottom:  0,
            }}>
              {submitError}
            </p>
          )}

          {/* Policy checkbox + send */}
          <div
            className="cm-bottom"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              paddingTop:     'clamp(20px, 3vw, 36px)',
              gap:            '16px',
              flexWrap:       'wrap',
            }}
          >
            {/* Checkbox + policy label */}
            <label
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '10px',
                cursor:      'none',
                userSelect:  'none',
              }}
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              {/* Hidden native checkbox */}
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={e => setForm(p => ({ ...p, agreed: e.target.checked }))}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              {/* Custom checkbox box */}
              <span
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          '18px',
                  height:         '18px',
                  borderRadius:   '4px',
                  border:         `1.5px solid ${form.agreed ? ACC : `${INK}28`}`,
                  background:     form.agreed ? ACC : 'transparent',
                  flexShrink:     0,
                  transition:     'all 0.18s ease',
                }}
              >
                {form.agreed && (
                  <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden>
                    <path d="M1 3.5L3.8 6.5L9 1" stroke="#fff" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span style={{
                fontSize:      '11px',
                fontWeight:    500,
                letterSpacing: '0.04em',
                color:         form.agreed ? INK : `${INK}60`,
                transition:    'color 0.18s ease',
              }}>
                I agree to the{' '}
                <span
                  style={{
                    borderBottom:   `1px solid ${ACC}`,
                    color:          ACC,
                    fontWeight:     600,
                    paddingBottom:  '1px',
                  }}
                >
                  privacy policy
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={!form.agreed || submitting}
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '10px',
                fontSize:      '12px',
                fontWeight:    700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         '#fff',
                background:    form.agreed ? INK : `${INK}30`,
                padding:       '14px 36px',
                borderRadius:  '100px',
                border:        'none',
                cursor:        'none',
                transition:    'background 0.22s ease',
                opacity:       submitting ? 0.7 : 1,
                pointerEvents: form.agreed && !submitting ? 'auto' : 'none',
              }}
              onMouseEnter={e => { if (form.agreed) { e.currentTarget.style.background = ACC; setCursorType('hover') } }}
              onMouseLeave={e => { if (form.agreed) { e.currentTarget.style.background = INK; setCursorType('default') } }}
            >
              {submitting ? 'Sending…' : 'Send'}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </form>
      </div>

    </div>
    </>
  )
}
