'use client'

import { useEffect, useRef } from 'react'
import Link from '@/components/ui/TransitionLink'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
import { useHeaderVisibilityStore } from '@/store/useHeaderVisibilityStore'
import AboutSection from '@/components/sections/AboutSection'

gsap.registerPlugin(ScrollTrigger)

/* ─── Tokens ─────────────────────────────────────────────────────── */
const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const RING_SIZE = 120
const RING_R    = 48
const RING_CIRC = 2 * Math.PI * RING_R

/* ─── Card stack positions (front → back, bottom-anchored) ──────────
   Each card in the stack holds one fixed image, so the number of slots
   here IS the number of gallery images a visitor ever sees — the
   rotation below only moves cards between these slots, it never swaps
   what a card is showing. At three slots only the first three images
   were ever reachable no matter how many the project had.

   Deliberately still bottom out at y:-115, the same as the previous
   three-slot version, with the steps compressed rather than extended:
   the deepest card's peek above the stack box is what the mobile
   layout is spaced around (globals.css sets .wk-cardstack-wrap's
   margin-top to 128px specifically to clear it), so keeping that
   envelope means five cards need no layout changes anywhere. Steps
   shrink toward the back, which also reads as perspective rather than
   a flat ladder. */
const STACK = [
  { y:    0, scale: 1.000, opacity: 1.00, zIndex: 12, filter: 'blur(0px)'   }, // front — sharp, full size
  { y:  -38, scale: 0.945, opacity: 0.92, zIndex: 11, filter: 'blur(1.8px)' },
  { y:  -70, scale: 0.898, opacity: 0.82, zIndex: 10, filter: 'blur(3.4px)' },
  { y:  -96, scale: 0.858, opacity: 0.70, zIndex:  9, filter: 'blur(4.9px)' },
  { y: -115, scale: 0.824, opacity: 0.57, zIndex:  8, filter: 'blur(6.4px)' }, // back — same peek as the old 3-slot back
]
const STACK_COUNT = STACK.length

/* ─── Projects ───────────────────────────────────────────────────── */
interface Project {
  id: string; slug: string; title: string; type: string
  stack: string[]; desc: string
  url: string // internal /work/[slug] detail page — see page.tsx
  image: string; gallery: string[]
}


/* ─── Per-project preview frames — real gallery screenshots ─────────
   Cover image first, then gallery — cover always leads (it wasn't
   previously: gallery-OR-cover meant the image chosen as the project's
   "main" one in admin wasn't guaranteed to be what a visitor saw first
   here). Deduplicated in case the same image was ever set as both the
   cover and part of the gallery.

   Returns min(imgs.length, STACK_COUNT) frames — up to 5, but never
   padded out to 5 by repeating an image. A project with 4 images used
   to get a 5th card that was just its cover image again (i % imgs.length
   wrapping back to 0), which read as a real duplicate, not a preview of
   a 5th thing. A project with 0 images still gets exactly one "No
   preview" card — never zero, since CardStack needs at least one frame
   to render at all. */
function getFrames(p: Project): React.ReactNode[] {
  const imgs = Array.from(new Set([p.image, ...p.gallery].filter(Boolean)))
  const frameCount = Math.max(1, Math.min(imgs.length, STACK_COUNT))
  return Array.from({ length: frameCount }).map((_, i) => (
    <div key={i} style={{ position: 'relative', width: '100%', height: '100%', background: 'rgba(255,255,255,0.04)' }}>
      {imgs.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element -- gallery
        // images can be arbitrary admin-entered URLs (MediaField allows
        // pasting any URL, not just local uploads), which next/image
        // would reject unless every possible host were pre-whitelisted
        // in next.config.js. A plain img works for any host immediately.
        <img
          src={imgs[i]}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
            No preview
          </span>
        </div>
      )}
    </div>
  ))
}

/* ─── Card stack — "next, next, next" queue animation ───────────────
   STACK_COUNT browser-window cards stacked bottom-anchored.
   On each tick: the front card fades out, every card behind it steps
   forward one slot, and the exited card re-enters at the back of the
   stack. All transitions run at fixed speed, independent of scroll.
   ─────────────────────────────────────────────────────────────────── */
function CardStack({ p }: { p: Project }) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const frames   = getFrames(p)
  /* Real frame count for THIS project, not always STACK_COUNT — a
     project with fewer images than slots gets a shorter stack (see
     getFrames), so the rotation below has to use only as many STACK
     positions as there are actual cards. Using STACK[STACK_COUNT-1] as
     "the back slot" regardless would reset a 3-card stack's exiting
     card to the 5-deep position, disconnected from its own 3-card
     group. orderRef sizes to match for the same reason. */
  const count    = frames.length
  const orderRef = useRef(Array.from({ length: count }, (_, i) => i))

  useEffect(() => {
    const els = cardRefs.current.filter((el): el is HTMLDivElement => el !== null)
    if (els.length < count) return

    /* Set initial stack positions */
    els.forEach((el, i) => {
      gsap.set(el, {
        ...STACK[i],
        transformOrigin: 'bottom center',
      })
    })

    /* A single image has nothing to rotate with — one static card. */
    if (count < 2) return

    const interval = setInterval(() => {
      const order    = orderRef.current
      const front    = order[0]
      const frontEl  = els[front]
      const backSlot = STACK[count - 1]

      /*
       * Timing is unchanged from the original three-card version, just
       * expressed for N slots:
       *
       * t=0.00  front fades out fast (0.10s)
       * t=0.00  the card behind it begins zooming to front (0.62s expo.out)
       * t=0.08  every card further back steps forward — lagging slightly
       *          so the slot each one is leaving still looks occupied
       *          while the front card is on its way out
       * t=0.10  front is invisible → snap to the back slot, fade in (0.36s)
       *
       * Gap where the back slot has no card = t(0.08 → 0.10) ≈ 20ms, and
       * the card heading there has barely moved by then, so it reads as
       * continuous.
       */

      /* 1. Front disappears quickly, then re-enters at the back */
      gsap.to(frontEl, {
        opacity:  0,
        duration: 0.10,
        ease:     'power1.in',
        onComplete() {
          gsap.set(frontEl, { ...backSlot, opacity: 0 })
          gsap.to(frontEl,  { opacity: backSlot.opacity, duration: 0.36, ease: 'power2.out' })
        },
      })

      /* 2. Everyone behind steps forward one slot. The card taking the
         front slot gets the longer, undelayed "hero" move; the rest lag
         by 0.08s, exactly as the three-card version had it. */
      for (let i = 1; i < order.length; i++) {
        gsap.to(els[order[i]], {
          ...STACK[i - 1],
          duration: i === 1 ? 0.62 : 0.55,
          ease:     'expo.out',
          delay:    i === 1 ? 0 : 0.08,
        })
      }

      orderRef.current = [...order.slice(1), front]
    }, 1100)

    return () => clearInterval(interval)
    // count only changes if this project's own image count changes —
    // effectively never for an already-mounted card stack, so this
    // doesn't introduce spurious re-runs, just correctly re-derives the
    // rotation if it ever did.
  }, [count])

  return (
    /* aspectRatio, not a fixed height clamp — the old clamp(220px,30vw,
       420px) sized height independently of width, so on a wide viewport
       (col-right can be 700px+) the card ended up around 1.67:1 while
       every real project screenshot is ~2:1 (checked directly: all 5
       current images are 2536-2551 × 1277-1281px). That mismatch is
       what object-fit:cover was cropping into the sides to compensate
       for. Deriving height from width instead keeps the card's own
       shape matched to what's actually being shown. */
    <div className="wk-cardstack" style={{ position:'relative', width:'100%', aspectRatio:'2/1' }}>
      {frames.map((frame, i) => (
        <div
          key={i}
          ref={el => { cardRefs.current[i] = el }}
          style={{
            position:     'absolute',
            /* top:0 alongside bottom:0 (not bottom-only) — this box used
               to get its height for free from wk-cardstack-frame's own
               explicit clamp() height inside it, back when that was a
               fixed value instead of height:'100%'. Once it became a
               percentage, this box needed a definite height of its own
               for that percentage to resolve against; without top set,
               an absolutely positioned box with only `bottom` and no
               `height` sizes to its in-flow content, and its only
               content (the frame's <img>) is itself absolutely
               positioned — excluded from that calculation — so it
               collapsed to ~0 and silently took the whole percentage
               chain down to the image with it. Pinning all four sides
               gives it wk-cardstack's own aspect-ratio-derived height
               directly, which is what wk-cardstack-frame's 100% (and
               everything under it) actually needs to resolve against. */
            top:          0,
            bottom:       0,
            left:         0,
            right:        0,
            borderRadius: '12px',
            overflow:     'hidden',
            border:       '1px solid rgba(255,255,255,0.12)',
            boxShadow:    '0 4px 16px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset',
          }}
        >
          <div className="wk-cardstack-frame" style={{ height:'100%', overflow:'hidden' }}>
            {frame}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Single panel ───────────────────────────────────────────────────
   panelIdx: this panel's position in the shared slide-stack (1..N,
   since panel 0 is About) — drives the wk-panel-N CSS class used for
   the scroll-jacked transition targeting.
   ringIdx/ringTotal: project-relative position (0..N-1) — drives the
   ring's own display ("01/04" etc.) and dot geometry, decoupled from
   panelIdx so the ring still reads as "project 1 of 4" rather than
   jumping straight to "2 of 5" just because About now occupies slot 0.
   ─────────────────────────────────────────────────────────────────── */
function Panel({ p, panelIdx, ringIdx, ringTotal }: { p: Project; panelIdx: number; ringIdx: number; ringTotal: number }) {
  const { setCursorType } = useCursorStore()

  return (
    <div
      className={`wk-panel wk-panel-${panelIdx}`}
      style={{ position:'absolute', inset:'14px', borderRadius:'32px', overflow:'hidden', background:INK, willChange:'transform' }}
    >
      {/* Blurred cover photo — the panel's only source of color now.
          No fixed palette tint, no brand-color blobs: whatever mood
          the background has comes entirely from the project's own
          image, not a color assigned by its position in the stack. */}
      <div aria-hidden style={{ position:'absolute', inset:0, overflow:'hidden', zIndex:0 }}>
        <div style={{ position:'absolute', inset:'-12%', filter:'blur(80px) brightness(0.55)', transform:'scale(1.18)' }}>
          {getFrames(p)[0]}
        </div>
      </div>

      {/* Vignette — for text legibility over the photo, not for color */}
      <div aria-hidden style={{ position:'absolute', inset:0, zIndex:1, background:'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(0,0,0,0.48) 100%)' }} />

      {/* Content grid */}
      <div className="wk-content-grid" style={{
        position:'absolute', inset:0, zIndex:2,
        display:'grid',
        gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)',
        padding:'clamp(1.8rem,2.4vw,2.6rem)',
        gap:'clamp(1.5rem,2.8vw,3rem)',
      }}>

        {/* ── LEFT col: ring pinned top-left, content pinned bottom — aligns with images ── */}
        <div className="wk-col-left" style={{ position:'relative' }}>

          {/* Ring counter — top-left, offset down */}
          <div className="wk-content wk-ring-wrap" style={{ position:'absolute', top:'clamp(1.4rem,2.2vw,2.8rem)', left:0, width:`${RING_SIZE}px`, height:`${RING_SIZE}px`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px' }}>

            <svg width={RING_SIZE} height={RING_SIZE} style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              {/* Track */}
              <circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
              {/* One small dot per project on the track */}
              {Array.from({ length: ringTotal }).map((_, t) => {
                const angle = (t / ringTotal) * 2 * Math.PI
                const dx = RING_SIZE / 2 + RING_R * Math.cos(angle)
                const dy = RING_SIZE / 2 + RING_R * Math.sin(angle)
                return <circle key={t} cx={dx} cy={dy} r="2" fill={t === ringIdx ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.22)'} />
              })}
              {/* Progress arc */}
              <circle className={`wk-ring wk-ring-${ringIdx}`} cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_R} fill="none" stroke="rgba(255,255,255,0.80)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC} />
            </svg>

            {/* Center content */}
            <span style={{ fontSize:'6.5px', letterSpacing:'0.24em', textTransform:'uppercase', color:'rgba(255,255,255,0.30)', position:'relative', zIndex:1 }}>Project</span>
            <span style={{ fontSize:'26px', fontWeight:800, letterSpacing:'-0.04em', color:'rgba(255,255,255,0.92)', position:'relative', zIndex:1, lineHeight:1.1 }}>{p.id}</span>
            <div style={{ width:'16px', height:'1px', background:'rgba(255,255,255,0.18)', position:'relative', zIndex:1, margin:'3px 0' }} />
            <span style={{ fontSize:'9px', fontWeight:400, letterSpacing:'0.04em', color:'rgba(255,255,255,0.28)', position:'relative', zIndex:1 }}>/{String(ringTotal).padStart(2,'0')}</span>
          </div>

          {/* Title + desc + CTA — positioned at green mark (upper-middle of left col) */}
          <div className="wk-title-block" style={{ position:'absolute', top:'46%', left:0, right:0 }}>
            {/* textAlign was 'justify' — fine for body copy with many
                words per line, but this heading can be just 2-3 words
                at a huge font size (e.g. "Foundly. UAE Lost & Found
                Platform"), and justify stretches text to fill the full
                line width by inserting extra space *between* words —
                with only a couple of words on a line, that gap becomes
                enormous, reading as scattered/disconnected words rather
                than one title. 'left' wraps naturally instead. */}
            {/* maxWidth:13ch forces this onto (at least) two lines even for
                a short title like "WAutomation Platform", which otherwise
                fit on one line at wider desktop widths and read as a
                different, smaller-feeling block than the two-line titles
                next to it. Same 13ch value already used for this exact
                reason on the Services listing heading. Verified live at
                1920/1440/1024/820/375px — both current titles land on
                exactly 2 lines at every one of them; textWrap:'balance'
                (already set) keeps the two lines close in length rather
                than one long line and one short orphan word. */}
            <h3 className="wk-left" style={{ fontSize:'clamp(36px,4.8vw,78px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:0.92, color:'#fff', textTransform:'uppercase', margin:'0 0 1.1rem', maxWidth:'13ch', textAlign:'left', textWrap:'balance', wordBreak:'normal', overflowWrap:'normal' } as React.CSSProperties}>{p.title}</h3>
            {/* textAlign was 'justify' — same problem as the heading above
                and the hero's own paragraph: at 420px max-width and 13px
                type, a justified line often has very few words, and
                justify stretches those into large, uneven gaps rather
                than reading as normal body copy. 'left' wraps naturally. */}
            {/* Line-clamped to 3 rather than trimmed by character count —
                a fixed character count doesn't reliably land on the same
                number of lines across descriptions of different word
                lengths, while this caps the rendered height at exactly 3
                lines regardless of how long p.desc actually is, ellipsis
                and all, with zero effect on the underlying data. */}
            <p className="wk-left" style={{
              fontSize: '13px', lineHeight: 1.9, color: 'rgba(255,255,255,0.52)',
              margin: '0 0 1.7rem', maxWidth: '420px', textAlign: 'left',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as React.CSSProperties}>{p.desc}</p>
            <Link href={p.url} className="wk-left"
              style={{
                display:'inline-flex', alignItems:'center', gap:'10px',
                fontSize:'12px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase',
                color:'rgba(255,255,255,0.72)', textDecoration:'none',
                borderBottom:'1px solid rgba(255,255,255,0.28)',
                paddingBottom:'4px',
                transition:'color 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.75)'; setCursorType('hover') }}
              onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.28)'; setCursorType('default') }}
            >
              View Details
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* ── RIGHT col: tags pushed down from nav, cards pinned bottom — fully independent ── */}
        <div className="wk-col-right" style={{ position:'relative', paddingTop:'clamp(3rem,5vw,5.5rem)' }}>

          {/* Type + tags — sit naturally after paddingTop, clear of the nav */}
          <div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <p className="wk-type" style={{
              fontSize:'clamp(12px,1.05vw,15px)', fontWeight:600,
              letterSpacing:'0.22em', textTransform:'uppercase',
              color:'rgba(255,255,255,0.90)', margin:0,
            }}>
              {p.type}
            </p>
            <div className="wk-line" style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.18)', transformOrigin:'left center' }} />
            {/* Frosted-glass pills instead of plain text + "·" dividers —
                same treatment already used for tags on WorkPageGrid's
                project cards (rgba(255,255,255,0.10) fill, blur(12px),
                a faint 1px border), scaled up to this section's larger
                type. gap on the wrapping flex replaces the manual
                margin the old "·" spacers provided. className="wk-tag"
                is unchanged on the element GSAP actually animates, so
                the existing blur-in stagger keeps working exactly as
                before — only the dot spacer (which was also picking up
                that same animation, redundantly) is gone. */}
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'7px' }}>
              {p.stack.map((tech) => (
                <span key={tech} className="wk-tag" style={{
                  display:        'inline-flex',
                  fontSize:       'clamp(9px,0.7vw,11px)',
                  fontWeight:     500,
                  letterSpacing:  '0.1em',
                  textTransform:  'uppercase',
                  color:          'rgba(255,255,255,0.78)',
                  /* Heavier blur plus a touch of saturation, matching the
                     frosted treatment used elsewhere on the site (the
                     header pill, the page-transition overlay) — at 12px
                     and no saturate these read as flat translucent chips
                     rather than glass. */
                  background:     'rgba(255,255,255,0.08)',
                  backdropFilter:       'blur(20px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                  border:         '1px solid rgba(255,255,255,0.16)',
                  borderRadius:   '999px',
                  padding:        '5px 11px',
                  lineHeight:     1,
                } as React.CSSProperties}>
                  {tech}
                </span>
              ))}
            </div>
            <div className="wk-line" style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.18)', transformOrigin:'left center' }} />
          </div>

          {/* Cards — pinned to bottom, independent from tags */}
          <div className="wk-cardstack-wrap" style={{ position:'absolute', bottom:0, left:0, right:0 }}>
            <CardStack p={p} />
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────────
   About now lives here as panel 0, sharing this exact pin/slide-stack
   system with the project panels — not as a separate pinned section
   that hands off to normal scroll before this one takes over. Scroll
   forward from About and a project slides up to cover it exactly the
   way each subsequent project covers the one before it; scroll back
   and About is what's underneath again. ONE continuous pin for the
   whole sequence.
   Panel 0 (About) gets ABOUT_HOLD_UNITS "slots" of dead time before
   the first transition begins (each project-to-project transition is
   1 slot = 100dvh). The reveal itself (title, word-by-word statement,
   stats, CTA) is time-based, not tied to this scroll distance — see
   revealPanel(0) below — so this hold isn't scroll runway for an
   animation to finish in, it's purely "how far do you have to scroll
   past About before the first project starts covering it." Kept
   deliberately small — a fraction of a viewport-height, not a whole
   extra screen of scrolling — since a full unit here was exactly the
   "too much scroll to reach the project section" complaint. */
const ABOUT_HOLD_UNITS  = 0.35  // slots reserved for About before transitions start

export default function WorkSection({ aboutSettings, projects }: { aboutSettings?: Record<string, unknown>; projects?: Project[] }) {
  /* Admin's "Featured" star-toggle drives this. No fallback to demo
     content — an empty array here just means the pinned sequence below
     holds on the About panel (idx 0) and releases immediately, since
     PROJECTS.map(...) below produces zero project panels. */
  const PROJECTS        = projects || []
  const sectionRef     = useRef<HTMLElement>(null)
  const progressRef    = useRef<(HTMLDivElement | null)[]>([])
  const progressWrapRef = useRef<HTMLDivElement>(null)
  const prevActiveIdx  = useRef<number>(-1)
  /* Tracked separately from prevActiveIdx because content reveals fire on
     a deliberately later threshold than the progress dots — see the
     revealIdx comment in onUpdate below. */
  const prevRevealIdx  = useRef<number>(-1)
  const animatedPanels = useRef<Set<number>>(new Set())
  /* About's title/bio/stats/CTA should only ever reveal once per page
     load — unlike animatedPanels (which resetPanels() clears whenever
     you scroll back above the whole section), this never resets, so
     once shown they just stay visible for the rest of the session. */
  const aboutIntroShown = useRef(false)
  /* The word statement's own scrub timeline — separate from the main
     panel-stack tl below (which drives xPercent/scale for the whole
     card stack). Kept as its own paused timeline instead of a second
     ScrollTrigger with its own scrub value: two independent scrubbed
     ScrollTriggers reading the same Lenis-driven scroll each apply
     their own lag/smoothing, and they don't reconcile with each other
     — that mismatch was the "works scrolling down, breaks scrolling
     up" bug. Driving .progress() directly off the exact same
     currentUnit already computed in the main onUpdate ties both to
     one single source of truth, so it's bidirectional by construction
     — no separate "reset and replay" logic needed at all. */
  const aboutWordTl = useRef<gsap.core.Timeline | null>(null)
  const aboutWordsForcedRef = useRef(false)
  const P          = PROJECTS.length            // project count (4)
  /* PIN_UNITS is how many "slots" the pinned timeline actually plays
     through (ABOUT_HOLD_UNITS dead time + P transitions = 6) — this is
     what self.progress maps onto, since a position:sticky element's
     pin only lasts for (outerHeight - viewportHeight) of scroll, not
     outerHeight itself. OUTER_UNITS is what the outer section's own
     height needs to be for that pin duration to equal exactly
     PIN_UNITS viewport-heights: one extra unit, to account for the
     viewport-height that becomes the sticky's own visible frame
     rather than contributing to the pin duration. Getting this wrong
     (using PIN_UNITS for both) was a real bug caught in testing: the
     project transitions started a full viewport-height early. */
  const PIN_UNITS   = ABOUT_HOLD_UNITS + P
  const OUTER_UNITS = PIN_UNITS + 1
  const { hide: hideHeader, show: showHeader } = useHeaderVisibilityStore()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.wk-panel') // [About, ...4 projects] = 5 total
      const isMobile = window.innerWidth < 768

      function revealPanel(idx: number) {
        /* Panel 0 is About — a completely different layout/content
           from the project panels, so it gets its own reveal instead
           of the generic wk-content/wk-left/wk-type selectors below
           (which simply don't exist inside it and would no-op).
           The word statement itself is NOT handled here — it's scrub-
           driven straight off scroll position in the main onUpdate
           below (see aboutWordTl), which is what makes it replay
           correctly in both directions. This function only handles
           the title/bio/stats/CTA, which reveal once and then stay. */
        if (idx === 0) {
          if (!aboutIntroShown.current) {
            aboutIntroShown.current = true
            /* Mobile/tablet only — on desktop the stats sit in their own
               row, visually separate enough that starting them while the
               statement is still animating in reads as parallel motion,
               not a race. Stacked single-column on mobile/tablet, stats
               sit directly under the statement, so the same overlap read
               as everything animating at once instead of a clear
               sequence. Pushing stats/CTA out until the statement's own
               fade (delay 0.45 + duration 0.9 = finishes ~1.35s) is done
               makes it step through: heading → stats one by one (still
               the same blur-in-and-stagger treatment as the project
               tags) → CTA. */
            const isMobileOrTablet = window.innerWidth < 1280
            gsap.fromTo('.ab-title',
              { y: -36, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }
            )
            gsap.fromTo('.ab-left-item',
              { x: -32, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.18, delay: 0.3 }
            )
            /* .ab-statement's own opacity is left alone here — that's the
               PARENT <p>, separate from the per-word ghost/reveal opacity
               the scroll-scrubbed aboutWordTl already drives on the child
               .ab-word spans. Fading the parent in as its own step means
               the statement (even at its dim resting "ghost" state) stays
               fully invisible until title/bio have already appeared,
               instead of being visible — however faintly — the instant
               any sliver of the panel scrolls into view, well before
               revealPanel(0) even fires (opacity is real CSS opacity, not
               gated by anything pre-reveal, so it was reading as "the
               statement peeks in before the heading does"). Opacity
               multiplies with the children's own, so this doesn't
               interfere with their independent ghost/scrub values. */
            gsap.fromTo('.ab-statement',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.45 }
            )
            gsap.fromTo('.ab-stat',
              { opacity: 0, filter: 'blur(10px)', x: 6 },
              { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.45, ease: 'power2.out', stagger: { each: 0.18, from: 'start' }, delay: isMobileOrTablet ? 1.4 : 0.6 }
            )
            gsap.fromTo('.ab-cta',
              { opacity: 0, filter: 'blur(10px)', x: 6 },
              { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.45, ease: 'power2.out', delay: isMobileOrTablet ? 2.25 : 1.14 }
            )
          }
          return
        }

        if (animatedPanels.current.has(idx)) return
        animatedPanels.current.add(idx)

        /* Ring counter — fades up independently */
        gsap.fromTo(`.wk-panel-${idx} .wk-content`,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        )

        /* Left col: heading → para → button, blur-in staggered */
        gsap.fromTo(`.wk-panel-${idx} .wk-left`,
          { opacity: 0, filter: 'blur(10px)', y: 10 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.65, stagger: { each: 0.14 }, ease: 'power2.out', delay: 0.10 }
        )

        /* Right col: step-by-step sequential reveal */
        const lines = gsap.utils.toArray<HTMLElement>(`.wk-panel-${idx} .wk-line`)
        const tl = gsap.timeline({ delay: 0.05 })

        // 1. Type label blurs in
        tl.fromTo(`.wk-panel-${idx} .wk-type`,
          { opacity: 0, filter: 'blur(8px)', y: 8 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.50, ease: 'power2.out' }
        )
        // 2. First line wipes in from left
        .fromTo(lines[0],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power3.out' },
          '-=0.10'
        )
        /* 3. Tags blur in one by one. clearProps drops `filter` entirely
           once each pill lands rather than leaving filter:blur(0px) on it
           — a filter (even a zero one) creates a containing block, which
           is exactly the kind of thing that stops the pill's own
           backdrop-filter from sampling the panel behind it. */
        .fromTo(`.wk-panel-${idx} .wk-tag`,
          { opacity: 0, filter: 'blur(14px)', y: 10, scale: 0.94 },
          {
            opacity: 1, filter: 'blur(0px)', y: 0, scale: 1,
            duration: 0.5, stagger: { each: 0.07 }, ease: 'power3.out',
            clearProps: 'filter',
          },
          '-=0.05'
        )
        // 4. Second line wipes in after last tag
        .fromTo(lines[1],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power3.out' },
          '+=0.04'
        )
      }

      function resetPanels() {
        animatedPanels.current.clear()
        prevActiveIdx.current = -1
        prevRevealIdx.current = -1
        /* .ab-title/.ab-left-item/.ab-stat/.ab-cta are deliberately NOT
           reset here — they're gated by aboutIntroShown instead, which
           never clears, so hiding them again on every onLeaveBack would
           strand them at opacity:0 forever the next time revealPanel(0)
           runs (it would see aboutIntroShown already true and skip
           re-revealing them). */
        panels.forEach((_, i) => {
          gsap.set(`.wk-panel-${i} .wk-content`, { opacity: 0, y: 16 })
          gsap.set(`.wk-panel-${i} .wk-type`,    { opacity: 0, filter: 'blur(8px)', y: 8 })
          gsap.set(`.wk-panel-${i} .wk-tag`,     { opacity: 0, filter: 'blur(14px)', y: 10, scale: 0.94 })
          gsap.set(`.wk-panel-${i} .wk-left`,    { opacity: 0, filter: 'blur(10px)', y: 10 })
          gsap.set(`.wk-panel-${i} .wk-line`,    { scaleX: 0 })
        })
      }

      /* Panel 0 (About) — starts hidden the same as every other panel's
         content, revealed via revealPanel(0) above. */
      gsap.set('.ab-title',     { opacity: 0, y: -36 })
      gsap.set('.ab-left-item', { opacity: 0, x: -32 })
      gsap.set('.ab-statement', { opacity: 0, y: 20 })
      gsap.set('.ab-stat',      { opacity: 0, filter: 'blur(10px)', x: 6 })
      gsap.set('.ab-cta',       { opacity: 0, filter: 'blur(10px)', x: 6 })

      /* Word statement — built once as a paused timeline, then scrubbed
         via .progress() from the main onUpdate below using the exact
         same currentUnit the rest of the section already drives off.
         .to() here captures each word's CURRENT opacity (the ghost
         0.07/0.30 set inline in AboutSection.tsx) as the animation's
         start value, so scrubbing to progress 0 always lands back on
         that resting ghost state, not fully invisible — matches how it
         looks before you've ever scrolled to it. */
      aboutWordTl.current = gsap.timeline({ paused: true })
        .to('.ab-word', {
          opacity: 1, ease: 'none',
          stagger: { each: 0.05, from: 'start' },
        })

      panels.forEach((_, i) => {
        if (i > 0) {
          /* xPercent, not yPercent — project panels wait off-screen to the
             RIGHT and slide in sideways (see the timeline below). Only the
             axis changed; the 100%-of-own-width offset and the 0.94 scale
             are the same values the vertical version used, and .wk-sticky's
             overflow:hidden clips them exactly the same way off the right
             edge as it did off the bottom. */
          gsap.set(`.wk-panel-${i}`, { xPercent:100, scale:0.94 })
        }
        /* All panels — content starts hidden so there's no flash on load */
        gsap.set(`.wk-panel-${i} .wk-content`, { opacity:0, y:16 })
        gsap.set(`.wk-panel-${i} .wk-type`,    { opacity:0, filter:'blur(8px)', y:8 })
        gsap.set(`.wk-panel-${i} .wk-tag`,     { opacity:0, filter:'blur(14px)', y:10, scale:0.94 })
        gsap.set(`.wk-panel-${i} .wk-left`,    { opacity:0, filter:'blur(10px)', y:10 })
        gsap.set(`.wk-panel-${i} .wk-line`,    { scaleX:0 })
      })

      gsap.fromTo('.wk-sticky',
        { y: 40 },
        { y: 0, ease:'power2.out', scrollTrigger:{ trigger:sectionRef.current!, start:'top 90%', end:'top top', scrub: isMobile ? 0.3 : 1.0 } }
      )

      ScrollTrigger.create({
        trigger:sectionRef.current!, start:'top 30%',
        onEnter:     () => revealPanel(0),
        onLeaveBack: () => resetPanels(),
      })

      /* Mobile AND tablet-portrait (<1024) — the sticky nav pill sits
         over enough of the panel (About's title, or a project's ring/
         tags) that it crowds the content at these widths too, same as
         mobile. A separate check from isMobile above (which stays
         768px — that one only tunes scrub feel for touch, unrelated to
         this) so this doesn't accidentally change animation timing.
         Hide it for the duration of this section's scroll-jacked
         range, show it again once the user has scrolled past (either
         direction). */
      const hideNavThroughWork = window.innerWidth < 1024
      if (hideNavThroughWork) {
        ScrollTrigger.create({
          trigger: sectionRef.current!,
          start:   'top top',
          end:     'bottom bottom',
          onEnter:     () => hideHeader(),
          onLeave:     () => showHeader(),
          onEnterBack: () => hideHeader(),
          onLeaveBack: () => showHeader(),
        })
      }

      /* Panel-stack timeline — About (panel 0) holds for ABOUT_HOLD_UNITS
         slots before the first transition begins (the word reveal
         itself is time-based now, see revealPanel(0) above — this hold
         is just a brief pause to actually see it, not scroll distance
         for a scrub to complete). Every project-to-project transition
         after that is 1 slot each, unchanged from before. */
      /* Horizontal, not vertical: each panel slides in from the right and
         covers the one before it, rather than rising up over it. Only the
         axis differs — the outgoing panel's -3 drift, its 0.92 scale-down
         and fade, the 1-unit duration and the easing are all the values
         the vertical version used, so the motion reads the same, just
         sideways. About (panel 0) exits the same way as any project panel,
         since it's panels[0] in this same loop. Everything driven off
         self.progress below (ring fill, progress dots, per-panel content
         reveals) is direction-agnostic and needed no change. */
      const tl = gsap.timeline()
      for (let i = 1; i <= P; i++) {
        const t = ABOUT_HOLD_UNITS + (i - 1)
        tl.to(panels[i-1], { scale:0.92, xPercent:-3, opacity:0, duration:1, ease:'power2.inOut' }, t)
        tl.to(panels[i],   { xPercent:0, scale:1, duration:1, ease:'power2.inOut' }, t)
      }

      /* scrub lag layers on top of Lenis's own smoothing — on touch,
         that double-smoothing reads as sluggish/disconnected from the
         actual swipe. A smaller scrub keeps this section snappier and
         closer to 1:1 with touch input, matching how the rest of the
         page already feels on mobile. */
      ScrollTrigger.create({
        animation:tl,
        trigger:sectionRef.current!, start:'top top', end:'bottom bottom', scrub: isMobile ? 0.5 : 1.5,
        onUpdate(self) {
          /* self.progress (0-1) maps across the trigger's own start/end
             range, which spans exactly PIN_UNITS viewport-heights (see
             the OUTER_UNITS comment above) — NOT OUTER_UNITS. About's
             dead time then has to be subtracted out before computing
             which project is "active", otherwise a naive floor(progress
             *N) treats every slot as equal width and misfires during
             the hold. */
          const currentUnit = self.progress * PIN_UNITS
          let activeIdx: number
          if (currentUnit < ABOUT_HOLD_UNITS) {
            activeIdx = 0
          } else {
            const transitionUnit = currentUnit - ABOUT_HOLD_UNITS
            activeIdx = Math.min(Math.floor(transitionUnit + 0.06) + 1, P)
          }

          /* Content reveals (heading, description, tags, CTA) fire on a
             LATER threshold than activeIdx above, which drives the
             progress dots. activeIdx flips at transitionUnit -0.06 —
             effectively the instant a panel begins sliding in — so the
             tag stagger ran and finished while the card was still mostly
             off-screen, and nobody ever saw it.

             A panel's entrance spans transitionUnit (i-1)..i, so +0.3
             fires it at raw progress 0.7 of its own tween. The tween uses
             power2.inOut, so 0.7 raw is 1 - 2*(0.3^2) = 0.82 of the
             distance actually travelled — i.e. the card is ~80% onto the
             screen, which is where this should start. */
          let revealIdx = 0
          if (currentUnit >= ABOUT_HOLD_UNITS) {
            revealIdx = Math.min(Math.floor(currentUnit - ABOUT_HOLD_UNITS + 0.3), P)
          }

          /* Scrub the word statement directly off scroll position —
             bidirectional by construction, since it's just reading
             currentUnit each frame rather than replaying a one-shot
             tween. Clamped past ABOUT_HOLD_UNITS so it stays fully
             revealed (not reset) while scrolled into the projects. */
          const wordProgress = gsap.utils.clamp(0, 1, currentUnit / ABOUT_HOLD_UNITS)
          aboutWordTl.current?.progress(wordProgress)

          /* Belt-and-suspenders: a couple of specific words (reported:
             "a" and the accent "C++") were staying visually stuck at
             their dim resting opacity even once scrolled well past
             this point, on every browser tested — not a timing/stagger
             race that ever catches up on its own. Rather than chase
             the exact cause inside GSAP's stagger internals, force
             every word to its fully-revealed end state directly once
             scroll has genuinely moved past the hold phase, bypassing
             the timeline/stagger machinery entirely for this case. Ref-
             gated so it's one hard correction, not a per-frame write. */
          if (wordProgress >= 1) {
            if (!aboutWordsForcedRef.current) {
              aboutWordsForcedRef.current = true
              gsap.set('.ab-word', { opacity: 1 })
            }
          } else {
            aboutWordsForcedRef.current = false
          }

          /* These dots represent "which project" — meaningless while
             About (idx 0) is active, since it isn't one of them. They
             used to just sit there dim from the very start instead of
             only appearing once there's an actual project to point at. */
          if (progressWrapRef.current) {
            progressWrapRef.current.style.opacity = activeIdx === 0 ? '0' : '1'
          }

          progressRef.current.forEach((bar, i) => {
            if (!bar) return
            const isActive = activeIdx - 1 === i // dot i represents project i (activeIdx 1..P)
            bar.style.height     = isActive ? '28px' : '16px'
            bar.style.background = isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)'
          })

          /* Ring fill tracks progress through the projects-only portion
             of the timeline, ignoring About's dead time — otherwise the
             ring would already be partway full the instant a project
             panel first appears. */
          const projectProgress = Math.max(0, Math.min((currentUnit - ABOUT_HOLD_UNITS) / P, 1))
          const offset = RING_CIRC * (1 - projectProgress)
          for (let i = 0; i < P; i++) {
            const ring = document.querySelector<SVGCircleElement>(`.wk-ring-${i}`)
            if (ring) ring.style.strokeDashoffset = `${offset}`
          }

          if (activeIdx !== prevActiveIdx.current) {
            prevActiveIdx.current = activeIdx
          }

          if (revealIdx !== prevRevealIdx.current) {
            prevRevealIdx.current = revealIdx
            setTimeout(() => revealPanel(revealIdx), 100)
          }
        },
      })

    }, sectionRef)
    return () => {
      ctx.revert()
      showHeader() // never leave the nav stuck hidden if this section unmounts mid-hide
    }
  }, [P, PIN_UNITS, hideHeader, showHeader])

  return (
    <section ref={sectionRef} className="wk-outer" style={{ height:`${OUTER_UNITS*100}dvh`, background:CREAM, position:'relative', zIndex:2, marginTop:'-120px' }}>
      <div className="wk-sticky" style={{ position:'sticky', top:0, height:'100dvh', overflow:'hidden', background:CREAM }}>

        {/* Panel 0 — About. Same floating-card treatment (inset + rounded
            corners) as the project panels so it reads as part of the
            same slide-stack rather than a differently-styled intruder. */}
        <div
          className="wk-panel wk-panel-0"
          style={{ position:'absolute', inset:'14px', borderRadius:'32px', overflow:'hidden', background:CREAM, willChange:'transform' }}
        >
          <AboutSection settings={aboutSettings} />
        </div>

        {PROJECTS.map((p,i) => <Panel key={p.id} p={p} panelIdx={i+1} ringIdx={i} ringTotal={P} />)}

        {/* Progress dots — represent the projects only, not About.
            Hidden (opacity 0, see onUpdate above) until the first
            project becomes active, since they're meaningless before
            that — there's no "project" for them to be pointing at yet. */}
        <div ref={progressWrapRef} style={{ position:'absolute', top:'2.5rem', right:'2.5rem', display:'flex', alignItems:'flex-end', gap:'4px', zIndex:20, opacity:0, transition:'opacity 0.3s ease' }}>
          {PROJECTS.map((_,i) => (
            <div key={i} ref={el=>{ progressRef.current[i]=el }}
              style={{ width:'2.5px', height:'16px', background:'rgba(255,255,255,0.20)', borderRadius:'2px', transition:'height 0.3s ease, background 0.3s ease' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
