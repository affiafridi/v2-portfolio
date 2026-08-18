'use client'

import { useEffect, useRef } from 'react'
import Link from '@/components/ui/TransitionLink'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

/* ─── Services ───────────────────────────────────────────────────── */
const SERVICES: ServiceItem[] = [
  { num: '01', label: 'Web Development',    tag: 'Full Stack'  },
  { num: '02', label: 'UI/UX Design',       tag: 'Interaction' },
  { num: '03', label: 'GSAP Animations',    tag: 'Motion'      },
  { num: '04', label: 'Creative Direction', tag: 'Concept'     },
  { num: '05', label: 'E-commerce',         tag: 'Commerce'    },
  { num: '06', label: 'CMS Integration',    tag: 'Content'     },
]

/* Per-service image: unique left offset for "own position" feel */
const IMG_OFFSETS = [
  { left: '4.5vw'  },
  { left: '3.0vw'  },
  { left: '5.0vw'  },
  { left: '3.5vw'  },
  { left: '4.0vw'  },
  { left: '3.0vw'  },
]

/* ─── Component ──────────────────────────────────────────────────── */
interface ServiceItem { num: string; label: string; tag: string; slug?: string; image?: string | null }

export default function ServiceSection({ services }: { services?: ServiceItem[] }) {
  const svcList = services && services.length > 0 ? services : SERVICES
  const sectionRef    = useRef<HTMLElement>(null)
  const listRef       = useRef<HTMLDivElement>(null)   // the actual list container
  const rowRefs       = useRef<(HTMLElement | null)[]>([])
  const labelRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const tagRefs       = useRef<(HTMLSpanElement | null)[]>([])
  const numRefs       = useRef<(HTMLSpanElement | null)[]>([])
  const lineRefs      = useRef<(HTMLDivElement | null)[]>([])  // top + 1 per row
  const floatRef      = useRef<HTMLDivElement>(null)
  const previewRefs   = useRef<(HTMLDivElement | null)[]>([])
  const prevIdx       = useRef(-1)
  const floatVisible  = useRef(false)
  const { setCursorType } = useCursorStore()
  const N = SERVICES.length

  /* ── Hover handlers ──────────────────────────────────────────── */
  const handleEnter = (idx: number) => {
    const row = rowRefs.current[idx]
    if (!row || !floatRef.current) return

    const prev = prevIdx.current

    /* Center the image vertically on the hovered row */
    const rect    = row.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2

    /* Position float — each service has its own left offset */
    gsap.killTweensOf(floatRef.current)
    gsap.set(floatRef.current, {
      /* Modulo, not a direct index — there's no cap on how many
         services can be marked featured now, so this has to stay
         safe past IMG_OFFSETS' own length instead of assuming a
         fixed max of 6. */
      left: IMG_OFFSETS[idx % IMG_OFFSETS.length].left,
      top:  centerY,
      y:    '-50%',
    })

    if (!floatVisible.current) {
      /* First appearance — zoom in from a shrunken state */
      gsap.set(floatRef.current, { scale: 0.72, opacity: 0 })
      gsap.to(floatRef.current, {
        opacity:  1,
        scale:    1,
        duration: 0.55,
        ease:     'back.out(1.4)',
      })
      floatVisible.current = true
    } else {
      /* Already showing — quick dip then snap back (cross-service zoom pop) */
      gsap.to(floatRef.current, { scale: 0.88, duration: 0.10, ease: 'power2.in' })
      gsap.to(floatRef.current, { scale: 1, duration: 0.42, ease: 'back.out(1.5)', delay: 0.10 })
    }

    /* Swap preview image — kill stale tweens first so no leftover opacity
       from a skipped service, then drive every preview to its target state */
    previewRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.killTweensOf(el)
      gsap.to(el, {
        opacity:  i === idx ? 1 : 0,
        duration: i === idx ? 0.35 : 0.15,
        ease:     i === idx ? 'power2.out' : 'power2.in',
      })
    })
    prevIdx.current = idx

    /* Only touch the outgoing and incoming labels — leave all others alone */
    if (prev >= 0 && prev !== idx) {
      if (labelRefs.current[prev])
        gsap.to(labelRefs.current[prev]!, { color: 'rgba(26,26,26,0.38)', duration: 0.28, ease: 'power2.out' })
      if (tagRefs.current[prev])
        gsap.to(tagRefs.current[prev]!,   { opacity: 0, x: 8, duration: 0.18 })
      if (numRefs.current[prev])
        gsap.to(numRefs.current[prev]!,   { opacity: 0.18, duration: 0.22 })
    }
    if (labelRefs.current[idx])
      gsap.to(labelRefs.current[idx]!, { color: INK, duration: 0.28, ease: 'power2.out' })
    if (tagRefs.current[idx])
      gsap.to(tagRefs.current[idx]!,   { opacity: 1, x: 0, duration: 0.24, ease: 'power2.out' })
    if (numRefs.current[idx])
      gsap.to(numRefs.current[idx]!,   { opacity: 0.55, duration: 0.22 })

    setCursorType('hover')
  }

  const handleLeave = () => {
    if (!floatRef.current) return
    gsap.killTweensOf(floatRef.current)
    gsap.to(floatRef.current, { opacity: 0, scale: 0.78, duration: 0.22, ease: 'power2.in' })
    floatVisible.current = false
    prevIdx.current = -1

    labelRefs.current.forEach(el =>
      el && gsap.to(el, { color: 'rgba(26,26,26,0.38)', duration: 0.28, ease: 'power2.out' }))
    tagRefs.current.forEach(el =>
      el && gsap.to(el, { opacity: 0, x: 6, duration: 0.18 }))
    numRefs.current.forEach(el =>
      el && gsap.to(el, { opacity: 0.18, duration: 0.22 }))

    setCursorType('default')
  }

  /* ── Setup & entrance animations ────────────────────────────── */
  useEffect(() => {

    /* ── Initial hidden states — identical props to WorkSection ── */
    /* Labels: same as wk-tag: blur(10px) + x:6, not y               */
    labelRefs.current.forEach(el => el && gsap.set(el, {
      color: 'rgba(26,26,26,0.38)', opacity: 0, filter: 'blur(10px)', x: 6,
    }))
    tagRefs.current.forEach(el     => el && gsap.set(el,  { opacity: 0, x: 6 }))
    numRefs.current.forEach(el     => el && gsap.set(el,  { opacity: 0 }))
    previewRefs.current.forEach(el => el && gsap.set(el,  { opacity: 0 }))
    lineRefs.current.forEach(el    => el && gsap.set(el,  { scaleX: 0, transformOrigin: 'left center' }))
    if (floatRef.current) gsap.set(floatRef.current, { opacity: 0, scale: 0.72 })

    const ctx = gsap.context(() => {

      /* Heading — duration scales with scroll velocity:
         slow scroll → 1.0s, fast scroll → 0.30s          */
      ScrollTrigger.create({
        trigger: sectionRef.current!,
        start:   'top 80%',
        once:    true,
        onEnter: (self) => {
          const vel = Math.abs(self.getVelocity())
          // vel ~300 = leisurely, ~2000+ = fast flick
          const dur = gsap.utils.clamp(0.30, 1.0, 1.0 - (vel / 2200) * 0.70)
          gsap.from('.sv-title', { y: -28, opacity: 0, duration: dur, ease: 'power3.out' })
        },
      })

      /* ── Main list reveal — mirrors WorkSection revealPanel() exactly ──
         Single timeline so everything is choreographed, not racing.
         Trigger: listRef (the list element itself, not the section top).
         start: 'top 60%' — list top must reach 60% down the viewport so
         at least the first row is already visible when the sequence starts.  */
      const lines  = lineRefs.current.filter(Boolean)  as HTMLDivElement[]
      const labels = labelRefs.current.filter(Boolean) as HTMLSpanElement[]
      const nums   = numRefs.current.filter(Boolean)   as HTMLSpanElement[]

      /* ── Service list reveal: label blurs in → its line wipes ──────
         Per-service sequence, fully sequential (no overlap):
           1. Label blurs in left→right  (+ number fades alongside)
           2. Its bottom divider wipes left→right
           3. Next label… and so on.
         Top divider fires first before the loop begins.
         ─────────────────────────────────────────────────────────── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: listRef.current!,
          start:   'top 80%',
          once:    true,
        },
        delay: 0.05,
      })

      /* Ensure all lines wipe strictly left → right */
      gsap.set(lines, { transformOrigin: 'left center' })

      /* Top divider wipes first */
      tl.fromTo(lines[0],
        { scaleX: 0 },
        { scaleX: 1, duration: 0.28, ease: 'power3.out' },
      )

      /* Per-service: label → number → bottom line */
      labels.forEach((label, i) => {

        /* Label blurs in */
        tl.fromTo(label,
          { opacity: 0, filter: 'blur(10px)', x: 6 },
          { opacity: 1, filter: 'blur(0px)',  x: 0,
            duration: 0.22, ease: 'power2.out' },
        )

        /* Number fades alongside label */
        if (nums[i]) {
          tl.fromTo(nums[i],
            { opacity: 0 },
            { opacity: 0.18, duration: 0.16, ease: 'power2.out' },
            '<',
          )
        }

        /* Bottom line wipes left→right after label settles */
        if (lines[i + 1]) {
          tl.fromTo(lines[i + 1],
            { scaleX: 0 },
            { scaleX: 1, duration: 0.26, ease: 'power3.out' },
          )
        }
      })

      /* CTA fades up */
      gsap.from('.sv-cta-wrap', {
        y: 20, opacity: 0, duration: 0.70, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-cta-wrap', start: 'top 92%', once: true },
      })

    }, sectionRef)

    /* ── Hide float when section is out of viewport ─────────────
       The float uses position:fixed so it persists in the viewport
       even after scrolling away. This ScrollTrigger force-hides it
       the moment the section leaves in either direction.
       ─────────────────────────────────────────────────────────── */
    const hideFloat = () => {
      if (!floatRef.current) return
      gsap.killTweensOf(floatRef.current)
      gsap.to(floatRef.current, { opacity: 0, scale: 0.78, duration: 0.20, ease: 'power2.in' })
      floatVisible.current = false
      prevIdx.current = -1
      labelRefs.current.forEach(el => el && gsap.to(el, { color: 'rgba(26,26,26,0.38)', duration: 0.20 }))
      tagRefs.current.forEach(el   => el && gsap.to(el, { opacity: 0, x: 6, duration: 0.15 }))
      numRefs.current.forEach(el   => el && gsap.to(el, { opacity: 0.18, duration: 0.18 }))
    }

    const visibilityST = ScrollTrigger.create({
      trigger:     sectionRef.current!,
      start:       'top bottom',
      end:         'bottom top',
      onLeave:     hideFloat,
      onLeaveBack: hideFloat,
    })

    /* Refresh after sticky WorkSection layout settles — this measures
       live DOM layout for every ScrollTrigger on the page (WorkSection's
       huge pinned multi-project setup included), which is genuinely
       expensive. A flat 400ms timer landed it squarely mid-flight
       through Hero's ~2s entrance animation (portrait/bio/headline
       still actively tweening at that point), causing a visible
       stutter right as the page loads. requestIdleCallback only runs
       it once the main thread is actually free instead of on a fixed
       clock, so it no longer competes with an animation still playing.
       Safari has no requestIdleCallback, hence the setTimeout fallback
       (kept at 400ms there — better than nothing, just not the fix). */
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => ScrollTrigger.refresh())
    } else {
      timeoutId = setTimeout(() => ScrollTrigger.refresh(), 400)
    }

    return () => {
      ctx.revert()
      visibilityST.kill()
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="sv-section"
      style={{ background: CREAM, position: 'relative', zIndex: 2, overflowX: 'hidden' }}
      onMouseLeave={handleLeave}
    >

      {/* ══ HEADING — identical to About ════════════════════════════ */}
      <div className="sv-heading-wrap" style={{ padding: 'clamp(64px,8vw,108px) clamp(32px,6.5vw,96px) 0' }}>
        <h2
          className="sv-title"
          style={{
            fontSize:      'clamp(72px, 11.5vw, 168px)',
            fontWeight:    800,
            letterSpacing: '-0.04em',
            lineHeight:    0.88,
            color:         INK,
            margin:        0,
            marginBottom:  'clamp(40px, 6vw, 80px)',
            userSelect:    'none',
          }}
        >
          Services
        </h2>
      </div>

      {/* ══ SERVICE LIST ════════════════════════════════════════════ */}
      <div
        className="sv-list"
        ref={listRef}
        style={{
          paddingLeft:  '34vw',
          paddingRight: 'clamp(32px, 6.5vw, 96px)',
        }}
      >
        {/* Top divider — animated */}
        <div
          className="sv-line"
          ref={el => { lineRefs.current[0] = el }}
          style={{ height: '1px', backgroundColor: 'rgba(26,26,26,0.10)', transformOrigin: 'left center' }}
        />

        {svcList.map((s, i) => {
          const rowContent = (
            <>
              {/* Name + tag */}
              <div className="sv-name-row" style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flex: 1, minWidth: 0 }}>
                <span
                  className="sv-name-label"
                  ref={el => { labelRefs.current[i] = el }}
                  style={{
                    fontSize:      'clamp(32px, 5.2vw, 82px)',
                    fontWeight:    800,
                    letterSpacing: '-0.03em',
                    lineHeight:    1.0,
                    textTransform: 'uppercase',
                    color:         'rgba(26,26,26,0.38)',
                    userSelect:    'none',
                    flexShrink:    0,
                    minWidth:      0,
                  }}
                >
                  {s.label}
                </span>
                <span
                  className="sv-tag-label"
                  ref={el => { tagRefs.current[i] = el }}
                  style={{
                    fontSize:      '10px',
                    fontWeight:    600,
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color:         ACC,       /* ← red/orange, matching nav */
                    opacity:       0,
                    whiteSpace:    'nowrap',
                    flexShrink:    0,
                  }}
                >
                  {s.tag}
                </span>
              </div>

              {/* Number */}
              <span
                ref={el => { numRefs.current[i] = el }}
                style={{
                  fontSize:      '10px',
                  fontWeight:    600,
                  letterSpacing: '0.18em',
                  color:         INK,
                  opacity:       0.18,
                  flexShrink:    0,
                  marginLeft:    '12px',
                }}
              >
                {s.num}
              </span>
            </>
          )

          const rowStyle: React.CSSProperties = {
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        'clamp(12px, 1.6vw, 22px) 0',
            cursor:         'none',
          }

          return (
          <div key={s.num}>
            {s.slug ? (
              <Link
                href={`/services/${s.slug}`}
                className="sv-row"
                ref={el => { rowRefs.current[i] = el }}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={handleLeave}
                style={rowStyle}
              >
                {rowContent}
              </Link>
            ) : (
              <div
                className="sv-row"
                ref={el => { rowRefs.current[i] = el }}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={handleLeave}
                style={rowStyle}
              >
                {rowContent}
              </div>
            )}

            {/* Bottom divider — not rendered for the last service */}
            {i < svcList.length - 1 && (
              <div
                className="sv-line"
                ref={el => { lineRefs.current[i + 1] = el }}
                style={{ height: '1px', backgroundColor: 'rgba(26,26,26,0.10)', transformOrigin: 'left center' }}
              />
            )}
          </div>
          )
        })}
      </div>

      {/* ══ SEE ALL — same as About CTA ════════════════════════════ */}
      <div
        className="sv-cta-wrap"
        style={{
          display:        'flex',
          justifyContent: 'center',
          padding:        'clamp(40px, 6vw, 80px) clamp(32px, 6.5vw, 96px)',
          margin:         '0 clamp(32px, 6.5vw, 96px)',
          borderTop:      `1px solid rgba(26,26,26,0.10)`,
        }}
      >
        <Link
          href="/services"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '10px',
            fontSize:       '12px',
            fontWeight:     600,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            color:          INK,
            textDecoration: 'none',
            borderBottom:   `1px solid rgba(26,26,26,0.28)`,
            paddingBottom:  '4px',
            transition:     'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ACC; e.currentTarget.style.borderColor = ACC; setCursorType('hover') }}
          onMouseLeave={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = 'rgba(26,26,26,0.28)'; setCursorType('default') }}
        >
          View all services
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
            <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* ══ FLOATING IMAGE — fixed, appears on hover ════════════════
          position:fixed keeps it in viewport regardless of scroll.
          Top is set dynamically to the hovered row's center.
          Each service has its own left offset.
          ═══════════════════════════════════════════════════════════ */}
      <div
        ref={floatRef}
        className="sv-float"
        style={{
          position:     'fixed',
          width:        'min(25vw, 340px)',
          aspectRatio:  '4/3',
          pointerEvents:'none',
          zIndex:       200,
          opacity:      0,
          borderRadius: '14px',
          overflow:     'hidden',
          boxShadow:    '0 24px 60px rgba(0,0,0,0.13), 0 2px 0 rgba(255,255,255,0.45) inset',
          border:       '1px solid rgba(0,0,0,0.07)',
        }}
      >
        {svcList.map((s, i) => (
          <div
            key={s.num}
            ref={el => { previewRefs.current[i] = el }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.04)' }}
          >
            {s.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- can
              // be any admin-entered URL (MediaField allows external
              // links, not just local uploads), which next/image would
              // reject unless every possible host were pre-whitelisted.
              <img
                src={s.image}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.18)' }}>
                  No preview
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

    </section>
  )
}
