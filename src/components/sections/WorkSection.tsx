'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'

gsap.registerPlugin(ScrollTrigger)

/* ─── Tokens ─────────────────────────────────────────────────────── */
const CREAM = '#f0eeea'
const INK   = '#1a1a1a'

/* ─── Ring geometry ──────────────────────────────────────────────── */
const RING_R    = 27
const RING_CIRC = 2 * Math.PI * RING_R   /* ~169.6 px */

/* ─── Projects ───────────────────────────────────────────────────── */
interface Project {
  id:    string
  title: string
  type:  string
  stack: string[]
  desc:  string
  url:   string
  bg:    string
  blobA: string
  blobB: string
}

const PROJECTS: Project[] = [
  {
    id: '01', title: 'Modevelle',
    type: 'Ecommerce Website',
    stack: ['Next.js', 'Shopify API', 'GSAP'],
    desc: "A demo e-commerce website for women's fashion — product listings, cart functionality, and user authentication. Built with Next.js and the Shopify Storefront API.",
    url: '#',
    bg:    '#241c14',
    blobA: 'rgba(195, 130, 55,  0.72)',
    blobB: 'rgba(100, 60,  18,  0.55)',
  },
  {
    id: '02', title: 'The Shear Room',
    type: 'Booking Website',
    stack: ['Next.js', 'Supabase', 'GSAP'],
    desc: 'A demo booking website for a unisex salon brand — service listings, end-to-end booking workflow, and user authentication. Built with Next.js and Supabase.',
    url: '#',
    bg:    '#101820',
    blobA: 'rgba(45, 105, 185,  0.70)',
    blobB: 'rgba(15, 48,  95,   0.55)',
  },
  {
    id: '03', title: 'Matilda Cake',
    type: 'Brand Website',
    stack: ['Next.js', 'Sanity CMS', 'Framer Motion'],
    desc: 'A premium brand website for a boutique cake studio — dynamic product gallery, custom order builder, and a seamless client inquiry flow.',
    url: '#',
    bg:    '#1e1018',
    blobA: 'rgba(185, 75,  155,  0.68)',
    blobB: 'rgba(90,  30,  80,   0.55)',
  },
  {
    id: '04', title: 'Portfolio v1',
    type: 'Personal Portfolio',
    stack: ['React', 'GSAP', 'Three.js'],
    desc: 'First iteration of my personal portfolio — advanced scroll animations, 3D canvas elements, and creative web interactions at the edge of the web.',
    url: '#',
    bg:    INK,
    blobA: 'rgba(255, 77,  0,   0.55)',
    blobB: 'rgba(255, 140, 40,  0.28)',
  },
]

/* ─── Browser-frame mockup ───────────────────────────────────────── */
function Mockup({ p }: { p: Project }) {
  return (
    <div
      className="wk-mockup"
      style={{
        width:          '100%',
        borderRadius:   '10px',
        overflow:       'hidden',
        border:         '1px solid rgba(255,255,255,0.10)',
        boxShadow:      '0 24px 64px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.05) inset',
        transform:      'perspective(1100px) rotateX(3deg)',
        background:     'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Chrome bar */}
      <div style={{
        height:       '28px',
        background:   'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', padding: '0 10px', gap: '5px',
      }}>
        {['#ff5f57', '#febc2e', '#28c840'].map(c => (
          <span key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c, opacity: 0.6 }} />
        ))}
        <div style={{ flex: 1, height: '14px', marginLeft: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px' }} />
      </div>
      {/* Gradient content */}
      <div style={{
        height:         'clamp(150px, 18vw, 260px)',
        background:     `
          radial-gradient(ellipse 65% 55% at 32% 32%, ${p.blobA}, transparent 68%),
          radial-gradient(ellipse 55% 65% at 75% 72%, ${p.blobB}, transparent 68%),
          ${p.bg}
        `,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '9px', fontWeight: 600, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.16)',
        }}>
          {p.title}
        </span>
      </div>
    </div>
  )
}

/* ─── Single panel ───────────────────────────────────────────────── */
function Panel({ p, idx, total }: { p: Project; idx: number; total: number }) {
  const { setCursorType } = useCursorStore()

  return (
    <div
      className={`wk-panel wk-panel-${idx}`}
      style={{
        position:     'absolute',
        inset:        '14px',
        borderRadius: '32px',        /* ← generous radius on all sides */
        overflow:     'hidden',
        background:   p.bg,
        willChange:   'transform',
      }}
    >
      {/* Background blobs */}
      <div aria-hidden style={{
        position:   'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 72% 62% at 22% 14%, ${p.blobA}, transparent 62%),
          radial-gradient(ellipse 58% 68% at 84% 82%, ${p.blobB}, transparent 62%)
        `,
      }} />

      {/* Vignette */}
      <div aria-hidden style={{
        position:   'absolute', inset: 0,
        background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)',
      }} />

      {/* ── Two-column grid ────────────────────────────────────────
          Left  (1fr):   progress ring at top · title/desc/CTA below
          Right (1.15fr): type+stack at top  · mockup fills the rest
          ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset:    0,
        display:  'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.15fr)',
        padding:  'clamp(1.8rem, 2.4vw, 2.6rem)',
        gap:      'clamp(1.5rem, 3vw, 3.5rem)',
      }}>

        {/* ── LEFT column ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Top: dynamic SVG progress ring */}
          <div
            className="wk-content"
            style={{
              position: 'relative',
              width: '68px', height: '68px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '2px',
              flexShrink: 0,
            }}
          >
            <svg
              width="68" height="68"
              style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
            >
              {/* Track */}
              <circle
                cx="34" cy="34" r={RING_R}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
              />
              {/* Fill — driven by GSAP onUpdate via className */}
              <circle
                className={`wk-ring wk-ring-${idx}`}
                cx="34" cy="34" r={RING_R}
                fill="none"
                stroke="rgba(255,255,255,0.80)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRC}
                strokeDashoffset={RING_CIRC}   /* starts empty */
              />
            </svg>
            <span style={{
              fontSize: '7.5px', letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)', position: 'relative', zIndex: 1,
            }}>
              Project
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.82)', position: 'relative', zIndex: 1,
            }}>
              {p.id}&nbsp;|&nbsp;{String(total).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom: title + description + CTA */}
          <div>
            <h3
              className="wk-content"
              style={{
                fontSize:      'clamp(36px, 4.8vw, 78px)',
                fontWeight:    800,
                letterSpacing: '-0.03em',
                lineHeight:    0.92,
                color:         '#ffffff',
                textTransform: 'uppercase',
                margin:        '0 0 1.1rem',
              }}
            >
              {p.title}
            </h3>

            <p
              className="wk-content"
              style={{
                fontSize:   '13px',
                lineHeight: 1.9,
                color:      'rgba(255,255,255,0.48)',
                margin:     '0 0 1.7rem',
              }}
            >
              {p.desc}
            </p>

            <a
              href={p.url}
              className="wk-content"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '9px',
                fontSize:       '11px',
                fontWeight:     600,
                letterSpacing:  '0.12em',
                textTransform:  'uppercase',
                color:          'rgba(255,255,255,0.70)',
                textDecoration: 'none',
                borderBottom:   '1px solid rgba(255,255,255,0.22)',
                paddingBottom:  '3px',
                transition:     'color 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.60)'
                setCursorType('hover')
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.70)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                setCursorType('default')
              }}
            >
              Visit site
              <svg width="13" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── RIGHT column ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Top: project type + stack */}
          <div className="wk-content" style={{ textAlign: 'right' }}>
            <p style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)', marginBottom: '9px',
            }}>
              {p.type}
            </p>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)', marginBottom: '9px' }} />
            <p style={{
              fontSize: '10px', letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
            }}>
              {p.stack.join(' · ')}
            </p>
          </div>

          {/* Bottom: browser mockup */}
          <Mockup p={p} />
        </div>

      </div>
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────── */
export default function WorkSection() {
  const sectionRef  = useRef<HTMLElement>(null)
  const progressRef = useRef<(HTMLDivElement | null)[]>([])
  const N           = PROJECTS.length

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.wk-panel')

      /* All panels except the first start below the viewport */
      panels.forEach((p, i) => { if (i > 0) gsap.set(p, { yPercent: 100 }) })

      /* ── Entry animation ───────────────────────────────────────────
         As the Work section scrolls over the About section, the sticky
         container animates from a scaled-down rounded card to a full
         viewport — feels like a panel launching forward off the page.
         ─────────────────────────────────────────────────────────────── */
      gsap.fromTo(
        '.wk-sticky',
        { scale: 0.88, y: 72, borderRadius: '40px' },
        {
          scale: 1, y: 0, borderRadius: '0px',
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current!,
            start:   'top bottom',   /* section bottom enters viewport */
            end:     'top top',      /* section top locks to top (pinned) */
            scrub:   0.8,
          },
        }
      )

      /* ── Panel 0: content animates in when section first enters ── */
      gsap.from('.wk-panel-0 .wk-content', {
        y: 24, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 65%', once: true },
      })
      gsap.from('.wk-panel-0 .wk-mockup', {
        x: 50, opacity: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 65%', once: true },
      })

      /* ── Scrubbed panel transition timeline ──────────────────────
         N panels → N-1 transitions. Each occupies 1 timeline unit.
         Section height N×100vh maps scroll distance to timeline.
         ─────────────────────────────────────────────────────────── */
      const tl = gsap.timeline()

      for (let i = 1; i < N; i++) {
        const t = i - 1

        /* Previous panel: shrinks & dims */
        tl.to(panels[i - 1], {
          scale: 0.90, yPercent: -4, opacity: 0.12,
          duration: 1, ease: 'power2.inOut',
        }, t)

        /* Incoming panel: rises from below */
        tl.to(panels[i], {
          yPercent: 0, duration: 1, ease: 'power2.inOut',
        }, t)

        /* Content fades in during the second half of the slide */
        tl.from(`.wk-panel-${i} .wk-content`, {
          y: 22, opacity: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out',
        }, t + 0.55)

        tl.from(`.wk-panel-${i} .wk-mockup`, {
          x: 55, opacity: 0, duration: 0.50, ease: 'power3.out',
        }, t + 0.48)
      }

      /* Wire timeline to scroll */
      ScrollTrigger.create({
        animation: tl,
        trigger:   sectionRef.current!,
        start:     'top top',
        end:       'bottom bottom',
        scrub:     1.5,

        onUpdate(self) {
          const rawProgress = self.progress * N
          const activeIdx   = Math.min(Math.floor(rawProgress + 0.06), N - 1)

          /* ── Progress bars ── */
          progressRef.current.forEach((bar, i) => {
            if (!bar) return
            bar.style.height     = i === activeIdx ? '28px' : '16px'
            bar.style.background = i === activeIdx
              ? 'rgba(255,255,255,0.92)'
              : 'rgba(255,255,255,0.20)'
          })

          /* ── Ring fill ────────────────────────────────────────────
             Each panel owns a 1/N slice of total progress [i/N, (i+1)/N].
             Its ring fills 0→1 as you scroll through that slice only.
             ─────────────────────────────────────────────────────── */
          for (let i = 0; i < N; i++) {
            const ring = document.querySelector<SVGCircleElement>(`.wk-ring-${i}`)
            if (!ring) continue
            const segStart  = i / N
            const segEnd    = (i + 1) / N
            const panelProg = Math.max(0, Math.min(1,
              (self.progress - segStart) / (segEnd - segStart)
            ))
            ring.style.strokeDashoffset = `${RING_CIRC * (1 - panelProg)}`
          }
        },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [N])

  return (
    <section
      ref={sectionRef}
      style={{ height: `${N * 100}vh`, background: CREAM }}
    >
      {/* Sticky viewport — also the entry animation target */}
      <div
        className="wk-sticky"
        style={{
          position:   'sticky',
          top:        0,
          height:     '100vh',
          overflow:   'hidden',
          background: CREAM,
        }}
      >
        {PROJECTS.map((p, i) => (
          <Panel key={p.id} p={p} idx={i} total={N} />
        ))}

        {/* ── Progress bars — top-right, inside the card area ── */}
        <div style={{
          position:   'absolute',
          top:        '2.5rem',
          right:      '2.5rem',
          display:    'flex',
          alignItems: 'flex-end',
          gap:        '4px',
          zIndex:     20,
        }}>
          {PROJECTS.map((_, i) => (
            <div
              key={i}
              ref={el => { progressRef.current[i] = el }}
              style={{
                width:        '2.5px',
                height:       i === 0 ? '28px' : '16px',
                background:   i === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)',
                borderRadius: '2px',
                transition:   'height 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
