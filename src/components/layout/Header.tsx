'use client'

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Link from '@/components/ui/TransitionLink'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCursorStore } from '@/store/useCursorStore'
import { useMenuStore }     from '@/store/useMenuStore'
import { scheduleMenuClose, cancelMenuClose } from '@/store/menuHoverTimer'
import { useContactStore }  from '@/store/useContactStore'
import { useHeaderVisibilityStore } from '@/store/useHeaderVisibilityStore'

/* ─── Nav data ───────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Index',    href: '/'         },
  { label: 'Work',     href: '/work'     },
  { label: 'Services', href: '/services' },
  { label: 'Blog',     href: '/blog'     },
  { label: 'Contact',  href: '/contact'  },
]

/* ─── Logo SVG ───────────────────────────────────────────────────── */
function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 16L12 8.5L15.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Nav item — bracket hover style ────────────────────────────── */
function NavItem({
  item,
  activeId,
  setActiveId,
  theme = 'dark',
  onClick,
  isCurrent = false,
}: {
  item:        { label: string; href: string }
  activeId:    string | null
  setActiveId: (v: string | null) => void
  theme?:      'light' | 'dark'
  onClick?:    () => void
  isCurrent?:  boolean
}) {
  const { setCursorType } = useCursorStore()
  const isActive = activeId === item.label

  const fg    = theme === 'light' ? '#1a1a1a'             : '#f0f0f0'
  const muted = theme === 'light' ? 'rgba(26,26,26,0.38)' : 'rgba(240,240,240,0.38)'

  const inner = (
    <span className="flex items-center">
      <span style={{ opacity: isActive ? 1 : 0, marginRight: isActive ? '3px' : '0', transition: 'opacity 0.18s ease, margin 0.18s ease' }}>
        [
      </span>
      <span>{item.label}</span>
      <span style={{ opacity: isActive ? 1 : 0, marginLeft: isActive ? '3px' : '0', transition: 'opacity 0.18s ease, margin 0.18s ease' }}>
        ]
      </span>
      {/* Current-page marker — same orange accent dot used everywhere
          else on this site (Hero, section labels, WorkPageHero's ball
          accent), here as a small "you are here" indicator. Always
          visible for the active route, not hover-gated like the
          brackets above. */}
      {isCurrent && (
        <span
          aria-hidden="true"
          style={{
            display:      'inline-block',
            width:        '4px',
            height:       '4px',
            borderRadius: '50%',
            background:   '#ff4d00',
            marginLeft:   '6px',
            flexShrink:   0,
          }}
        />
      )}
    </span>
  )

  const sharedProps = {
    className: 'relative px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em]',
    style: { color: isActive ? fg : muted, transition: 'color 0.2s ease' } as React.CSSProperties,
    onMouseEnter: () => { setActiveId(item.label); setCursorType('hover') },
    onMouseLeave: () => setCursorType('default'),
  }

  if (onClick) {
    return (
      <button {...sharedProps} onClick={onClick} style={{ ...sharedProps.style, background: 'none', border: 'none', cursor: 'none' }}>
        {inner}
      </button>
    )
  }

  return (
    <Link href={item.href} {...sharedProps}>
      {inner}
    </Link>
  )
}

/* ─── DEFAULT header — nav only (logo lives in root Header) ─────── */
function DefaultHeader() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const pathname  = usePathname()
  const { open: openContact } = useContactStore()

  // Work detail pages (/work/slug) have a dark hero — use white nav text
  const theme: 'light' | 'dark' = /^\/work\/.+/.test(pathname) ? 'dark' : 'light'

  // Index only matches the exact root; every other item also covers its
  // own detail pages (/work/[slug], /services/[slug], /blog/[slug]).
  const isCurrentPage = (href: string) =>
    href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <motion.div
      key="default"
      className="pointer-events-none fixed left-0 right-0 top-0 z-50"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex justify-center pt-7">
        <nav
          className="pointer-events-auto flex items-center"
          onMouseLeave={() => setActiveId(null)}
        >
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              activeId={activeId}
              setActiveId={setActiveId}
              theme={theme}
              onClick={item.label === 'Contact' ? openContact : undefined}
              isCurrent={isCurrentPage(item.href)}
            />
          ))}
        </nav>
      </div>
    </motion.div>
  )
}

/* ─── STICKY header — dark pill ──────────────────────────────────── */
function StickyHeader() {
  const { setCursorType }                   = useCursorStore()
  const { open, close, isOpen }             = useMenuStore()
  const { open: openContact }               = useContactStore()
  const { visible: headerVisible }          = useHeaderVisibilityStore()

  return (
    <motion.div
      key="sticky"
      className="pointer-events-none fixed left-0 right-0 z-50 flex justify-center px-4"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 18px)' }}
      initial={{ opacity: 0, y: -20 }}
      animate={headerVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -80 }}
      exit={{ opacity: 0, y: -20 }}
      transition={
        !headerVisible
          ? { duration: 0.35, ease: [0.4, 0, 1, 1] }           /* hide: quick ease-in, slides up */
          : { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } /* show/mount: same feel as before */
      }
    >
      {/* Background/border/text opacities all bumped up from their
         original values — on a page whose own hero is already near-
         black (ProjectDetail's `#0d0d0d`, essentially the same value
         as this pill's old rgba(10,10,10,0.90) background), the pill
         had almost no visible edge against it and its 38%-opacity idle
         text read as barely-there. A lighter pill fill + stronger
         border gives it a real boundary against any backdrop — dark
         hero or light cream — rather than needing to know what's
         behind it, and the brighter idle text is easier to read
         everywhere, not just on the dark-hero pages this was reported
         from. */}
      <nav
        className="pointer-events-auto flex items-center justify-between px-6 py-4"
        style={{
          width:                'min(90vw, 500px)',
          background:           'rgba(30,30,30,0.92)',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:               '1px solid rgba(240,240,240,0.16)',
          borderRadius:         '20px',
        }}
      >
        {/* Left: Let's talk → opens ContactModal */}
        <button
          onClick={openContact}
          className="text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'rgba(240,240,240,0.62)', transition: 'color 0.2s ease', background: 'none', border: 'none', cursor: 'none', padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.62)'; setCursorType('default') }}
        >
          Let&apos;s talk
        </button>

        {/* Center: logo */}
        <Link
          href="/"
          aria-label="Home"
          style={{ color: 'rgba(240,240,240,0.70)', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.70)'; setCursorType('default') }}
        >
          <LogoMark />
        </Link>

        {/* Right: Menu toggle — hover to open */}
        <button
          className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'rgba(240,240,240,0.62)', transition: 'color 0.2s ease' }}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onMouseEnter={(e) => { cancelMenuClose(); open(); e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { scheduleMenuClose(close); e.currentTarget.style.color = 'rgba(240,240,240,0.62)'; setCursorType('default') }}
        >
          Menu
          {/* Fixed h-6 w-6 — same box MenuOverlay's Close "×" circle uses
             (h-6 w-6 rounded-full). The two buttons share this exact
             right-side padding (px-6) in visually-identical containers,
             so matching the icon's own bounding box too is what makes
             the right edge land on the same pixel in both states —
             before this, the hamburger's lines sized to their own
             ~16px content instead of a fixed box, landing a few px
             short of where the close circle's edge sits, so opening
             read as a small jump instead of the label/icon swapping
             in place. */}
          <span className="flex h-6 w-6 flex-col items-center justify-center gap-[4px]" aria-hidden="true">
            <motion.span
              className="block h-px w-4 bg-current"
              animate={isOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
            />
            <motion.span
              className="block h-px bg-current"
              animate={isOpen ? { rotate: -45, y: -3.5, width: 16 } : { rotate: 0, y: 0, width: 10 }}
              transition={{ duration: 0.22 }}
            />
          </span>
        </button>
      </nav>
    </motion.div>
  )
}

/* ─── Root export ────────────────────────────────────────────────── */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { setCursorType } = useCursorStore()

  /* ── Logo dot: positioned independently of "Aftab" ────────────────
     mix-blend-mode has to live on the fixed+z-indexed link itself (see
     comment below) — putting it on an inner span instead traps the
     blend inside the stacking context that position:fixed + z-index
     already creates, so it stops blending against the real page and
     just renders as flat white. But mix-blend-mode on the link also
     blends EVERYTHING painted inside it as one unit, so a literal
     orange dot placed inside would get run through the same
     difference math as "Aftab" and stop looking orange. Rendering the
     dot as a separate, non-blended sibling element — positioned at
     "Aftab"'s measured right edge — is what lets both things be true
     at once. */
  const [logoHover, setLogoHover] = useState(false)
  const aftabRef = useRef<HTMLAnchorElement>(null)
  const [dotPos, setDotPos] = useState<{ left: number; bottom: number } | null>(null)

  useLayoutEffect(() => {
    const el = aftabRef.current
    if (!el) return
    /* Measuring the link's own box (getBoundingClientRect on the <a>)
       and estimating the dot's vertical position from an em-multiple
       of that box put the dot noticeably off — a couple of guessed
       constants away from where the text glyphs actually sit. Using a
       Range over the link's text content instead gives the real,
       tight glyph bounding box (its .bottom lands right on the text
       baseline), so "left"/"bottom" here come from measurement, not
       an estimate. ResizeObserver re-measures on any box change (font
       load, hot-reload layout shift), not just window resize. */
    const measure = () => {
      const range = document.createRange()
      range.selectNodeContents(el)
      const rect = range.getBoundingClientRect()
      /* Guard against a degenerate (all-zero) measurement — this is
         what was actually causing the dot to render off in a corner
         disconnected from "Aftab" entirely: an early call landing
         before layout had settled (React 18 Strict Mode double-
         invokes effects in dev, and the very first of the two could
         race the text's own layout) measured an empty {0,0,0,0} rect
         and *committed* it as the dot's position. Skipping a
         degenerate result here just leaves the previous (or no) dot
         position in place until the next legitimate measurement — the
         ResizeObserver fires again as soon as the element's real size
         is established, which self-corrects within the same frame or
         two rather than ever showing the wrong spot. */
      if (rect.width === 0 && rect.height === 0 && rect.left === 0 && rect.bottom === 0) return
      setDotPos({ left: rect.right, bottom: rect.bottom })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure, { passive: true })
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  useEffect(() => {
    const handler = () => {
      /* Below 1280px the Hero portrait spans the section's full width and
         sits flush at the top (see the 768-1023 and 1024-1279 HeroSection
         breakpoints in globals.css) — right where this header renders. The
         scroll-triggered DefaultHeader uses dark ink nav text (unless on a
         /work/slug page), which reads as fine over the desktop's narrower,
         right-aligned portrait but goes invisible over that full-width dark
         photo: not actually missing, just unreadable until scrolling 80px
         past it into the dark StickyHeader pill. Below 1280px there's no
         width where the portrait DOESN'T sit under the header, so — same
         as mobile — always show the sticky pill instead of waiting on
         scroll position. */
      if (window.innerWidth < 1280) { setScrolled(true); return }
      setScrolled(window.scrollY > 80)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
    }
  }, [])

  return (
    <>
      {/* ── Logo — standalone fixed, NEVER inside a Framer Motion parent.
           An animated opacity/transform ancestor traps mix-blend-mode into
           its own stacking context, breaking the inversion — same reason
           mixBlendMode has to stay on THIS element (position:fixed + an
           explicit z-index already creates a stacking context of its own)
           rather than on an inner span; a version of this that nested it
           one level deeper rendered as flat white instead of blending
           against the page. This element has no compositing ancestor so
           it blends directly against the page. */}
      {/* Logo — hidden on mobile (sticky header has its own logo) */}
      <Link
        ref={aftabRef}
        href="/"
        className="hidden md:block"
        style={{
          position:      'fixed',
          left:          '2rem',
          top:           '1.75rem',
          zIndex:        60,
          fontSize:      'clamp(20px, 2vw, 26px)',
          fontWeight:    700,
          letterSpacing: '-0.02em',
          color:         '#ffffff',
          mixBlendMode:  'difference',
          pointerEvents: 'auto',
          opacity:       logoHover ? 0.65 : 1,
          transition:    'opacity 0.2s ease',
        }}
        onMouseEnter={() => { setLogoHover(true);  setCursorType('hover')   }}
        onMouseLeave={() => { setLogoHover(false); setCursorType('default') }}
      >
        Aftab
      </Link>

      {/* Dot — a separate, unblended sibling positioned from "Aftab"'s
          measured glyph box (left/bottom, both real measurements — see
          the ResizeObserver above, not estimated). Being outside the
          link's own stacking context is what keeps it a true, literal
          orange instead of getting swept into the difference blend. */}
      {dotPos !== null && (
        <span
          aria-hidden
          className="hidden md:block"
          style={{
            position:      'fixed',
            left:          dotPos.left + 4,
            top:           dotPos.bottom - 5,
            zIndex:        60,
            width:         '5px',
            height:        '5px',
            borderRadius:  '50%',
            background:    '#ff4d00',
            pointerEvents: 'none',
            opacity:       logoHover ? 0.65 : 1,
            transition:    'opacity 0.2s ease',
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {scrolled ? <StickyHeader key="sticky" /> : <DefaultHeader key="default" />}
      </AnimatePresence>
    </>
  )
}
