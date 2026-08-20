'use client'

import { useEffect, useRef, useState } from 'react'
import Link from '@/components/ui/TransitionLink'
import LoopingVideo from '@/components/ui/LoopingVideo'
import { gsap } from 'gsap'
import { useMenuStore }    from '@/store/useMenuStore'
import { useCursorStore }  from '@/store/useCursorStore'
import { useContactStore } from '@/store/useContactStore'
import { scheduleMenuClose, cancelMenuClose } from '@/store/menuHoverTimer'

/* ─────────────────────────────────────────────────────────────────
   MenuOverlay — Centered floating panel, same width as sticky header.

   STRUCTURE
   ─────────
   • Full-screen backdrop  (z-299): blurs the hero behind, click = close
   • Centered panel        (z-300): width = min(90vw, 500px), top-0
     The centering wrapper is a plain div (translateX -50%).
     GSAP animates only clipPath on the inner panel — no conflict.

   OPEN  animation: clipPath bottom 100% → 0%  (sheet unrolls from top)
   CLOSE animation: clipPath bottom 0%   → 100% (snaps back up)
   ───────────────────────────────────────────────────────────────── */

interface NavItem { num: string; label: string; href: string; note: string; video?: string }

const NAV_ITEMS: NavItem[] = [
  { num: '01', label: 'Index',    href: '/',         note: 'Home',              video: '/uploads/1786797880514-index.mp4'        },
  { num: '02', label: 'Work',     href: '/work',     note: 'Selected projects', video: '/uploads/1786798419823-work.mp4'         },
  { num: '03', label: 'Services', href: '/services', note: 'What I build',     video: '/uploads/1786800780051-services.mp4'     },
  { num: '04', label: 'Blog',     href: '/blog',     note: 'My writing',       video: '/uploads/1786798317843-blog.mp4'         },
  { num: '05', label: 'Contact',  href: '/contact',  note: 'Let\'s talk',      video: '/uploads/1786796888930-lets-connect.mp4' },
]

const BG      = '#0d0d0d'
const CREAM   = '#f0eeea'
const ACCENT  = '#ff4d00'
const DIVIDER = 'rgba(240,238,234,0.07)'
const MUTED   = 'rgba(240,238,234,0.32)'

export default function MenuOverlay() {
  const { isOpen, close }     = useMenuStore()
  const { setCursorType }     = useCursorStore()
  const { open: openContact } = useContactStore()

  const panelRef = useRef<HTMLDivElement>(null)
  const tlRef    = useRef<gsap.core.Timeline | null>(null)

  /* Latches true on first open and stays true — the thumbnails are then
     kept mounted so reopening the menu is instant (browser cache) rather
     than re-fetching. See the render site for why they aren't mounted
     from the start. */
  const [hasOpened, setHasOpened] = useState(false)
  useEffect(() => { if (isOpen) setHasOpened(true) }, [isOpen])

  /* ── Hover thumbnail — reveals inline, before the item's label ──
     A fixed-size <Image> (not `fill`) sits inside an overflow:hidden
     wrapper whose width tweens 0 → THUMB_W. Because the image itself
     never resizes, growing the wrapper just uncovers more of the same
     static image left→right — a clean wipe, not a rescale/zoom.
     Landscape, not square — a 56x56 square read as too small next to
     the heading-sized label text; wider + object-fit:cover keeps the
     gif's own framing intact instead of squeezing it into a square. */
  const THUMB_W = 116 // px
  const THUMB_H = 72  // px
  const thumbRefs   = useRef<(HTMLSpanElement | null)[]>([])
  const thumbTweens = useRef<(gsap.core.Timeline | null)[]>([])
  const pointerFine = useRef(true)

  useEffect(() => {
    pointerFine.current = window.matchMedia('(pointer: fine)').matches
  }, [])

  /* One persistent, paused timeline per thumb, built once — same fix
     as the Reach Out gif: rebuilding a fresh chained timeline on every
     hover (the previous approach) meant a quick re-hover before the
     old one finished could leave two overlapping timelines fighting
     over the same element, which is what "breaks around 70% then
     jumps to full" actually was — killTweensOf cancels tweens by
     target, but a hover fired mid-flight could still catch it between
     phases. .play()/.reverse() on one shared timeline can't collide
     with itself, and .reverse() playing the exact same timeline
     backward is what makes the close a literal mirror of the open
     instead of a separately hand-tuned tween that could drift out of
     sync with it.
     Single continuous ease for width, not the earlier three-phase
     "hesitate then snap" — that layered easing suits a rare one-shot
     flourish (the contact GIF popup), not a hover that can retrigger
     many times a second as the cursor moves down a list.
     Height and width are NOT one simultaneous tween, on purpose —
     animating both together from 0 reads as a dot expanding outward
     in both directions at once, not the left-to-right slide the
     contact/Reach-Out reveals have (where height is a fixed value the
     whole time and only width moves). Height still has to start at 0
     here — a permanently-full height on every row, hovered or not, is
     the exact "gaps in the list" bug this component was already fixed
     for once — so instead it snaps open near-instantly (0.1s) just
     before width starts its slide, so by the time width has moved at
     all, height is already fully there and everything after reads as
     a pure horizontal slide. Reversed, the order flips: width slides
     shut first (the visible majority of the motion), height only
     collapses right at the very end — a slide-closed, not a shrinking
     dot. */
  useEffect(() => {
    thumbTweens.current = NAV_ITEMS.map((item, idx) => {
      const thumb = thumbRefs.current[idx]
      if (!item.video || !thumb) return null
      const tl = gsap.timeline({ paused: true })
      tl.to(thumb, { height: THUMB_H, duration: 0.1, ease: 'power2.out' })
        .to(thumb, { width: THUMB_W, duration: 0.5, ease: 'power2.out' }, 0.05)
      return tl
    })
  }, [])

  const handleRowEnter = (idx: number) => {
    setCursorType('hover')
    if (!pointerFine.current) return
    thumbTweens.current[idx]?.play()
  }

  const handleRowLeave = (idx: number) => {
    setCursorType('default')
    if (!pointerFine.current) return
    thumbTweens.current[idx]?.reverse()
  }

  const resetThumbs = () => {
    thumbTweens.current.forEach(tl => tl?.progress(0).pause())
  }

  /* ── Lock scroll — event-based, not layout-based ─────────────────
     This used to be body.style.overflow:hidden, which doesn't actually
     stop scrolling on this site: Lenis drives scroll itself via JS, so
     the page kept moving underneath the menu on wheel/touch regardless
     of the native overflow value. Same fix ContactModal already uses
     for the identical problem — lenis.stop() plus intercepting the
     events that cause scrolling, rather than a CSS/layout toggle (which
     is also what that file's own comment warns against: changing body's
     box model here previously desynced WorkSection's ScrollTrigger-
     pinned panel stack on close).
     No isInsideModal exemption like ContactModal's — this panel is
     overflow:hidden by design (see its own "never show scrollbar" note
     below) and never scrolls internally, so there's nothing legitimate
     to carve out; every scroll event is blocked while open. */
  useEffect(() => {
    const lenis = (window as unknown as Record<string, unknown>).__lenis as
      | { stop: () => void; start: () => void }
      | undefined

    if (!isOpen) {
      lenis?.start()
      return
    }

    lenis?.stop()

    const preventScroll = (e: Event) => { e.preventDefault() }

    const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])
    const preventKeyScroll = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) e.preventDefault()
    }

    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('keydown', preventKeyScroll, { passive: false })

    return () => {
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('keydown', preventKeyScroll)
      lenis?.start()
    }
  }, [isOpen])

  /* ── GSAP panel animation ────────────────────────────────────── */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    tlRef.current?.kill()

    if (isOpen) {
      /* Reset child elements so stagger is fresh each open */
      gsap.set(['.mo-topbar', '.mo-logo', '.mo-item', '.mo-footer'], {
        clearProps: 'opacity,y,filter',
      })
      gsap.set('.mo-line', { scaleX: 0 })

      const tl = gsap.timeline()
      tlRef.current = tl

      const lines = gsap.utils.toArray<HTMLElement>('.mo-line')

      /* Panel unrolls from top */
      tl.fromTo(panel,
          { clipPath: 'inset(0% 0% 100% 0% round 20px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.68, ease: 'expo.inOut' }
        )
        /* Topbar */
        .from('.mo-topbar',
          { y: -10, opacity: 0, duration: 0.28, ease: 'power2.out' },
          0.10
        )
        /* Logo blurs in */
        .fromTo('.mo-logo',
          { opacity: 0, filter: 'blur(8px)', y: 8 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.38, ease: 'power2.out' },
          0.20
        )
        /* Line 1 wipes — starts with logo, doesn't block nav */
        .fromTo(lines[0],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.38, ease: 'power3.out' },
          0.28
        )
        /* Nav items blur in — start right after line begins, no waiting */
        .fromTo('.mo-item',
          { opacity: 0, filter: 'blur(10px)', x: 6 },
          { opacity: 1, filter: 'blur(0px)',  x: 0, duration: 0.38, stagger: { each: 0.07 }, ease: 'power2.out' },
          0.34
        )
        /* Line 2 wipes as last item is coming in */
        .fromTo(lines[1],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.38, ease: 'power3.out' },
          0.68
        )
        /* Footer blurs in */
        .fromTo('.mo-footer',
          { opacity: 0, filter: 'blur(8px)', y: 6 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.32, ease: 'power2.out' },
          0.72
        )

    } else {
      resetThumbs()
      const tl = gsap.timeline()
      tlRef.current = tl

      tl.to(['.mo-logo', '.mo-item', '.mo-footer'], {
          opacity: 0, filter: 'blur(6px)', y: -8, duration: 0.16, stagger: 0.02, ease: 'power2.in',
        })
        .to(panel, {
          clipPath: 'inset(0% 0% 100% 0% round 20px)',
          duration: 0.50, ease: 'expo.inOut',
        }, 0.06)
    }
  }, [isOpen])

  return (
    <>
      {/* ── Full-screen backdrop — click outside to close ─────── */}
      <div
        className="fixed inset-0 z-[299]"
        style={{
          background:           'rgba(10,10,10,0.45)',
          backdropFilter:       isOpen ? 'blur(6px)' : 'none',
          WebkitBackdropFilter: isOpen ? 'blur(6px)' : 'none',
          opacity:              isOpen ? 1 : 0,
          pointerEvents:        isOpen ? 'auto' : 'none',
          transition:           'opacity 0.4s ease, backdrop-filter 0.4s ease',
        }}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Centering wrapper — NOT animated (owns translateX) ── */}
      {/* Matches StickyHeader's top exactly (Header.tsx) — including the
         safe-area-inset-top offset for notch/Dynamic Island devices,
         otherwise this opens a few dozen px below the pill on those
         phones, exposing background between them. */}
      <div
        className="fixed z-[300]"
        style={{
          top:           'calc(env(safe-area-inset-top, 0px) + 18px)',
          left:          '50%',
          transform:     'translateX(-50%)',
          width:         'min(90vw, 500px)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onMouseEnter={cancelMenuClose}
        onMouseLeave={() => scheduleMenuClose(close)}
      >
        {/* ── Animated panel (GSAP owns clipPath only) ────────── */}
        <div
          ref={panelRef}
          className="flex flex-col overflow-hidden"
          style={{
            background:   BG,
            clipPath:     'inset(0% 0% 100% 0% round 20px)',
            borderRadius: '20px',
            maxHeight:    'calc(100dvh - 40px)',
            overflow:     'hidden',   /* never show scrollbar — not even briefly during animation */
          }}
        >

          {/* ── TOP BAR ────────────────────────────────────────── */}
          {/* py-4, not py-5 — StickyHeader's nav (Header.tsx) uses py-4;
             the extra py-5 padding here made this row taller, which
             pushed its vertically-centered content (the Close button)
             a few px lower than where the Menu button sits in the
             shorter row — read as the icon landing "too far down" when
             the menu opens instead of swapping in place. */}
          <div
            className="mo-topbar flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${DIVIDER}` }}
          >
            {/* Availability pulse */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-[7px] w-[7px]">
                <span
                  className="absolute inline-flex h-full w-full rounded-full animate-ping"
                  style={{ background: '#22c55e', opacity: 0.55 }}
                />
                <span
                  className="relative inline-flex h-[7px] w-[7px] rounded-full"
                  style={{ background: '#22c55e' }}
                />
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: MUTED }}
              >
                Open for work
              </span>
            </div>

            {/* Close */}
            {/* translateX(-3px) — a measured-by-feel nudge on top of the
               py-4 fix above and the icon's own h-6 w-6 box (matching
               size to Header.tsx's Menu icon) — those two accounted for
               the bulk of the offset from the Menu button's position,
               this closes the last couple of px so the icon lands on
               the same spot instead of just close to it. */}
            <button
              onClick={close}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]
                         transition-colors duration-200"
              style={{ color: MUTED, transform: 'translateX(-3px)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = CREAM; setCursorType('hover') }}
              onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; setCursorType('default') }}
              aria-label="Close menu"
            >
              Close
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px]"
                style={{ border: `1px solid rgba(240,238,234,0.15)` }}
              >
                ×
              </span>
            </button>
          </div>

          {/* ── LOGO ───────────────────────────────────────────── */}
          <div
            className="mo-logo flex flex-col items-center py-7"
          >
            <span
              className="text-[28px] font-bold tracking-tight"
              style={{ color: CREAM }}
            >
              Aftab
              {/* A literal "." glyph at this weight/size renders as a
                  blocky square, not a dot — a real circle reads as the
                  same round "stop" used elsewhere on the site (footer
                  big-name dot, hero availability dot). */}
              <span
                aria-hidden
                style={{
                  display:      'inline-block',
                  width:        '0.16em',
                  height:       '0.16em',
                  borderRadius: '50%',
                  background:   ACCENT,
                  marginLeft:   '0.06em',
                  marginBottom: '0.02em',
                }}
              />
            </span>
            <span
              className="mt-1 text-[10px] uppercase tracking-[0.22em]"
              style={{ color: 'rgba(240,238,234,0.25)' }}
            >
              Full-Stack Developer
            </span>
          </div>

          {/* ── LINE 1 — wipes in after logo ───────────────────── */}
          <div className="mo-line" style={{ height: '1px', background: DIVIDER, transformOrigin: 'left center' }} />

          {/* ── NAV ITEMS ──────────────────────────────────────── */}
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item, idx) => {
              const isContact = item.label === 'Contact'
              const handleClick = () => {
                close()
                if (isContact) openContact()
              }
              const inner = (
                <>
                  {/* Number + thumb + label
                      items-center, not items-baseline — the label is no
                      longer a single text line sitting on the row, it's
                      the top line of a two-line stack (see below), and
                      baseline alignment against a multi-line flex child
                      doesn't resolve predictably across browsers. */}
                  <div className="mo-item-left flex items-center gap-4">
                    <span className="text-[10px] tabular-nums" style={{ color: ACCENT }}>
                      {item.num}
                    </span>
                    {item.video && (
                      <span
                        ref={el => { thumbRefs.current[idx] = el }}
                        className="mo-item-thumb"
                        style={{
                          display:      'inline-block',
                          width:        0,
                          height:       0,
                          overflow:     'hidden',
                          borderRadius: '10px',
                          flexShrink:   0,
                          alignSelf:    'center',
                        }}
                      >
                        {/* Held back until the menu has actually been opened
                            once. This overlay never unmounts — it's mounted on
                            every page and merely hidden with opacity — so
                            rendering these unconditionally meant every page
                            load fetched all five clips (11.2MB as GIFs) for a
                            menu most visitors never open. The wrapper span
                            still renders either way, so the GSAP hover
                            timelines built against thumbRefs are unaffected. */}
                        {hasOpened && (
                          <LoopingVideo
                            src={item.video}
                            style={{ display: 'block', width: `${THUMB_W}px`, height: `${THUMB_H}px`, maxWidth: 'none', objectFit: 'cover' }}
                          />
                        )}
                      </span>
                    )}
                    {/* Label + note, stacked — moved off the row's
                        opposite (right) side, where it sat alongside the
                        arrow. On hover the arrow slides in and the label
                        shifts right at the same time; with the note over
                        there too, all three were competing for attention
                        in the same glance. Underneath the label instead,
                        it reads as this item's own caption, undisturbed
                        by whatever the arrow is doing on the other side. */}
                    <div className="flex flex-col">
                      <span
                        className="text-[clamp(26px,5vw,40px)] font-bold leading-none tracking-tight
                                   transition-transform duration-300 group-hover:translate-x-1.5"
                        style={{ color: CREAM }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="mo-item-note mt-1 text-[10px] uppercase tracking-[0.1em]"
                        style={{ color: MUTED }}
                      >
                        {item.note}
                      </span>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="flex items-center">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center
                                 rounded-full text-[12px]
                                 -translate-x-2 opacity-0
                                 transition-all duration-300
                                 group-hover:opacity-100 group-hover:translate-x-0"
                      style={{ border: `1px solid rgba(240,238,234,0.18)`, color: CREAM }}
                    >
                      →
                    </span>
                  </div>
                </>
              )

              return isContact ? (
                <button
                  key={item.label}
                  onClick={handleClick}
                  className="mo-item group flex items-center justify-between px-6 py-3
                             transition-colors duration-200 w-full text-left"
                  style={{ background: 'none', border: `none`, borderBottom: `1px solid ${DIVIDER}`, cursor: 'none' }}
                  onMouseEnter={() => handleRowEnter(idx)}
                  onMouseLeave={() => handleRowLeave(idx)}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleClick}
                  className="mo-item group flex items-center justify-between px-6 py-3
                             transition-colors duration-200"
                  style={{ borderBottom: `1px solid ${DIVIDER}` }}
                  onMouseEnter={() => handleRowEnter(idx)}
                  onMouseLeave={() => handleRowLeave(idx)}
                >
                  {inner}
                </Link>
              )
            })}
          </nav>

          {/* ── LINE 2 — wipes in after nav items ──────────────── */}
          <div className="mo-line" style={{ height: '1px', background: DIVIDER, transformOrigin: 'left center' }} />

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <div
            className="mo-footer flex items-center justify-between gap-4 px-6 py-5"
          >
            {/* Location + email */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-[10px] uppercase tracking-[0.14em] truncate"
                style={{ color: 'rgba(240,238,234,0.25)' }}
              >
                Dubai, UAE
              </span>
              <a
                href="mailto:affiafridi.dev@gmail.com"
                className="text-[11px] tracking-wide truncate transition-colors duration-200"
                style={{ color: MUTED }}
                onMouseEnter={(e) => { e.currentTarget.style.color = CREAM; setCursorType('hover') }}
                onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; setCursorType('default') }}
              >
                affiafridi.dev@gmail.com
              </a>
            </div>

            {/* CTA */}
            <button
              onClick={() => { close(); openContact() }}
              className="flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2.5
                         text-[10px] font-medium uppercase tracking-[0.16em]
                         transition-all duration-300 hover:gap-3"
              style={{ background: CREAM, color: BG, border: 'none', cursor: 'none' }}
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              Let&apos;s work
              <span>↗</span>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
