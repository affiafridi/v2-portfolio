'use client'

import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'

gsap.registerPlugin(ScrollTrigger)

/* ─── Palette ────────────────────────────────────────────────────── */
const DARK  = '#0a0a0a'
const CREAM = '#f0eeea'
const ACC   = '#ff4d00'

const ITEM_DIM    = 'rgba(240,238,234,0.36)'
const ITEM_ACTIVE = 'rgba(240,238,234,0.68)'

/* ─── Data ───────────────────────────────────────────────────────── */
/*   dur = marquee loop duration in seconds — varies per row for     */
/*   layered rhythm; slower rows feel "heavier"                       */
const STACK = [
  { num: '01', label: 'Languages',      dur: 24, items: ['JavaScript', 'TypeScript', 'Python', 'PHP', 'SQL', 'Bash', 'Shell Script'] },
  { num: '02', label: 'Frameworks',     dur: 33, items: ['Next.js', 'React', 'Vue.js', 'Node.js', 'Express', 'Laravel', 'Nuxt.js'] },
  { num: '03', label: 'Motion & 3D',    dur: 19, items: ['GSAP', 'Framer Motion', 'Three.js', 'Lenis', 'ScrollTrigger', 'Anime.js', 'Motion One'] },
  { num: '04', label: 'Styling',        dur: 28, items: ['Tailwind CSS', 'Sass / SCSS', 'CSS Modules', 'Styled Components', 'PostCSS', 'Radix UI'] },
  { num: '05', label: 'CMS & Headless', dur: 21, items: ['Sanity', 'Contentful', 'WordPress', 'Webflow', 'Shopify', 'Strapi', 'Payload CMS'] },
  { num: '06', label: 'DevOps & Tools', dur: 31, items: ['Git / GitHub', 'Docker', 'Vercel', 'AWS', 'Figma', 'Postman', 'VS Code', 'Linear'] },
  { num: '07', label: 'CRM & SaaS',     dur: 27, items: ['HubSpot', 'Salesforce', 'Stripe', 'Supabase', 'Firebase', 'Klaviyo', 'Segment'] },
  { num: '08', label: 'Web Solutions',  dur: 36, items: ['E-commerce', 'SaaS Platforms', 'Portfolios', 'Dashboards', 'Custom Apps', 'REST APIs'] },
]

type TickerStart = () => void

/* ─── Row ────────────────────────────────────────────────────────── */
function StackRow({
  cat,
  onTickerReady,
}: {
  cat:           typeof STACK[0]
  onTickerReady: (start: TickerStart) => void
}) {
  const { setCursorType } = useCursorStore()

  const rowRef    = useRef<HTMLDivElement>(null)
  const numRef    = useRef<HTMLSpanElement>(null)
  const labelRef  = useRef<HTMLSpanElement>(null)
  const tickerRef = useRef<HTMLDivElement>(null)
  const vBarRef   = useRef<HTMLDivElement>(null)
  const countRef  = useRef<HTMLSpanElement>(null)
  const tweenRef  = useRef<gsap.core.Tween | null>(null)
  const active    = useRef(false)

  /* Each item appears twice so translateX(-50%) = 1× content width */
  const doubled = [...cat.items, ...cat.items]

  /* ── Ticker tween setup ──────────────────────────────────────── */
  useEffect(() => {
    if (!tickerRef.current) return

    /* Create the repeating tween, start paused at timeScale 0 */
    const tween = gsap.to(tickerRef.current, {
      x:        '-50%',
      duration: cat.dur,
      ease:     'none',
      repeat:   -1,
      paused:   true,
    })
    tweenRef.current = tween

    /* Tell the parent how to spin this row up */
    onTickerReady(() => {
      tween.timeScale(0)
      tween.play()
      /* Ease from 0 → 1 so it accelerates into motion */
      gsap.to(tween, { timeScale: 1, duration: 1.1, ease: 'power2.inOut' })
    })

    return () => tween.kill()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Hover handlers ─────────────────────────────────────────── */
  const onEnter = () => {
    active.current = true

    /* Smoothly decelerate the ticker to a stop */
    if (tweenRef.current)
      gsap.to(tweenRef.current, { timeScale: 0, duration: 0.62, ease: 'power2.out', overwrite: true })

    gsap.killTweensOf([rowRef.current, numRef.current, labelRef.current, vBarRef.current, countRef.current])

    gsap.to(rowRef.current,   { backgroundColor: 'rgba(240,238,234,0.026)', duration: 0.28, ease: 'power2.out' })
    gsap.to(vBarRef.current,  { scaleY: 1, duration: 0.50, ease: 'power3.out' })
    gsap.to(numRef.current,   { color: ACC,   duration: 0.22, ease: 'power2.out' })
    gsap.to(labelRef.current, { color: CREAM, scale: 1.04, duration: 0.26, ease: 'power2.out', transformOrigin: 'left center' })
    gsap.to(countRef.current, { opacity: 0.55, y: 0, duration: 0.30, ease: 'power2.out' })

    /* All items brighten to "active" level when ticker stops */
    const items = rowRef.current?.querySelectorAll<HTMLElement>('.sk-item')
    if (items) gsap.to([...items], { color: ITEM_ACTIVE, duration: 0.32, ease: 'power2.out' })

    setCursorType('hover')
  }

  const onLeave = () => {
    active.current = false

    /* Smoothly accelerate back to full speed */
    if (tweenRef.current)
      gsap.to(tweenRef.current, { timeScale: 1, duration: 0.58, ease: 'power2.in', overwrite: true })

    gsap.killTweensOf([rowRef.current, numRef.current, labelRef.current, vBarRef.current, countRef.current])

    gsap.to(rowRef.current,   { backgroundColor: 'rgba(0,0,0,0)',         duration: 0.30, ease: 'power2.out' })
    gsap.to(vBarRef.current,  { scaleY: 0,                                duration: 0.26, ease: 'power2.in'  })
    gsap.to(numRef.current,   { color: 'rgba(255,77,0,0.35)',             duration: 0.28, ease: 'power2.out' })
    gsap.to(labelRef.current, { color: 'rgba(240,238,234,0.28)', scale: 1, duration: 0.26, ease: 'power2.out' })
    gsap.to(countRef.current, { opacity: 0, y: 5, duration: 0.22, ease: 'power2.in' })

    /* All items dim back */
    const items = rowRef.current?.querySelectorAll<HTMLElement>('.sk-item')
    if (items) gsap.to([...items], { color: ITEM_DIM, duration: 0.28, ease: 'power2.out' })

    setCursorType('default')
  }

  /* When ticker is paused, individual items respond to cursor */
  const onItemEnter = (el: HTMLElement) => {
    if (!active.current) return
    gsap.to(el, { color: ACC, duration: 0.14, ease: 'power2.out' })
  }
  const onItemLeave = (el: HTMLElement) => {
    if (!active.current) return
    gsap.to(el, { color: ITEM_ACTIVE, duration: 0.22, ease: 'power2.out' })
  }

  return (
    <div
      className="sk-row"
      ref={rowRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display:      'flex',
        alignItems:   'stretch',
        borderBottom: '1px solid rgba(240,238,234,0.06)',
        position:     'relative',
        overflow:     'hidden',
        cursor:       'none',
      }}
    >
      {/* ─── Vertical left-edge accent bar ──────────────────────
          Slides down from top on hover. Gradient fades toward
          bottom so it doesn't box the row in.
          ──────────────────────────────────────────────────────── */}
      <div
        ref={vBarRef}
        style={{
          position:        'absolute',
          left: 0, top: 0, bottom: 0,
          width:           '2px',
          background:      `linear-gradient(180deg, ${ACC} 0%, rgba(255,77,0,0.38) 55%, transparent 100%)`,
          transformOrigin: 'top center',
          transform:       'scaleY(0)',
          zIndex:          3,
          pointerEvents:   'none',
        }}
      />

      {/* ─── Left column ─────────────────────────────────────── */}
      <div style={{
        width:          'clamp(148px, 16vw, 222px)',
        flexShrink:     0,
        padding:        'clamp(22px, 2.6vw, 36px) clamp(24px, 3vw, 48px)',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        gap:            '6px',
        borderRight:    '1px solid rgba(240,238,234,0.06)',
        position:       'relative',
      }}>
        <span
          ref={numRef}
          style={{
            fontSize:      '9px',
            fontWeight:    700,
            letterSpacing: '0.16em',
            color:         'rgba(255,77,0,0.35)',
            lineHeight:    1,
            display:       'block',
          }}
        >
          {cat.num}
        </span>
        <span
          ref={labelRef}
          style={{
            fontSize:      'clamp(10.5px, 0.90vw, 13px)',
            fontWeight:    600,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color:         'rgba(240,238,234,0.28)',
            lineHeight:    1.2,
            display:       'block',
          }}
        >
          {cat.label}
        </span>

        {/* Item count — slides up from bottom on hover */}
        <span
          ref={countRef}
          style={{
            position:      'absolute',
            bottom:        'clamp(12px, 1.4vw, 18px)',
            right:         'clamp(12px, 1.4vw, 18px)',
            fontSize:      '8px',
            fontWeight:    700,
            letterSpacing: '0.14em',
            color:         'rgba(240,238,234,0.55)',
            opacity:       0,
            transform:     'translateY(5px)',
            lineHeight:    1,
          }}
        >
          {String(cat.items.length).padStart(2, '0')}
        </span>
      </div>

      {/* ─── Ticker ──────────────────────────────────────────── */}
      {/*   mask-image fades text in/out at both edges so items   */}
      {/*   appear to emerge from and dissolve into the viewport   */}
      <div style={{
        flex:              1,
        overflow:          'hidden',
        display:           'flex',
        alignItems:        'center',
        maskImage:         'linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%)',
        WebkitMaskImage:   'linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%)',
      }}>
        <div
          ref={tickerRef}
          style={{ display: 'flex', width: 'max-content', willChange: 'transform' }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
            >
              <span
                className="sk-item"
                onMouseEnter={e => onItemEnter(e.currentTarget)}
                onMouseLeave={e => onItemLeave(e.currentTarget)}
                style={{
                  fontSize:      'clamp(12px, 1.02vw, 15.5px)',
                  fontWeight:    500,
                  letterSpacing: '0.01em',
                  color:         ITEM_DIM,
                  whiteSpace:    'nowrap',
                  padding:       'clamp(22px, 2.6vw, 36px) 0',
                  display:       'inline-block',
                  cursor:        'none',
                }}
              >
                {item}
              </span>
              <span style={{
                display:  'inline-block',
                margin:   '0 clamp(18px, 2.4vw, 36px)',
                fontSize: '5px',
                color:    'rgba(240,238,234,0.08)',
              }}>
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────── */
export default function StackSection() {
  const sectionRef   = useRef<HTMLElement>(null)
  const tickerStarts = useRef<TickerStart[]>([])

  /*
   * Stable per-row callbacks — created once so StackRow's
   * useEffect([], []) always gets the same function reference.
   */
  const rowCallbacks = useMemo(
    () => STACK.map((_, i) => (start: TickerStart) => { tickerStarts.current[i] = start }),
    [],
  )

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Heading drops in */
      gsap.from('.sk-title', {
        y: -32, opacity: 0, duration: 1.05, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 78%' },
      })
      gsap.from('.sk-sublabel', {
        y: 14, opacity: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 78%' },
      })

      /* Rows slide from right with stagger */
      gsap.from('.sk-row', {
        x:        60,
        opacity:  0,
        duration: 0.72,
        ease:     'power3.out',
        stagger:  0.07,
        scrollTrigger: {
          trigger: '.sk-rows',
          start:   'top 76%',
          onEnter() {
            /* Stagger-start each ticker so they "power on" one by one */
            tickerStarts.current.forEach((start, i) => {
              setTimeout(() => start?.(), 200 + i * 80)
            })
          },
        },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: DARK,
        /* Dot grid — very subtle, gives a technical / data-room feel */
        backgroundImage: 'radial-gradient(rgba(240,238,234,0.030) 1px, transparent 1px)',
        backgroundSize:  '26px 26px',
        position:        'relative',
        zIndex:          2,
      }}
    >
      {/* ── Heading ─────────────────────────────────────────────── */}
      <div style={{ padding: 'clamp(64px,8vw,108px) clamp(32px,6.5vw,96px) 0' }}>
        <div style={{
          display:        'flex',
          alignItems:     'flex-end',
          justifyContent: 'space-between',
          paddingBottom:  'clamp(32px, 4vw, 52px)',
          borderBottom:   '1px solid rgba(240,238,234,0.06)',
        }}>
          <h2
            className="sk-title"
            style={{
              fontSize:      'clamp(72px, 11.5vw, 168px)',
              fontWeight:    800,
              letterSpacing: '-0.04em',
              lineHeight:    0.88,
              color:         CREAM,
              margin:        0,
              userSelect:    'none',
            }}
          >
            Stack
          </h2>
          <span
            className="sk-sublabel"
            style={{
              fontSize:      '11px',
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'rgba(240,238,234,0.20)',
              paddingBottom: '12px',
            }}
          >
            Technologies & Tools
          </span>
        </div>
      </div>

      {/* ── Rows ────────────────────────────────────────────────── */}
      <div
        className="sk-rows"
        style={{ borderTop: '1px solid rgba(240,238,234,0.06)' }}
      >
        {STACK.map((cat, i) => (
          <StackRow
            key={cat.num}
            cat={cat}
            onTickerReady={rowCallbacks[i]}
          />
        ))}
      </div>

      <div style={{ height: 'clamp(64px, 8vw, 108px)' }} />
    </section>
  )
}
