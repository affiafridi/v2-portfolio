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
}: {
  item:        { label: string; href: string }
  activeId:    string | null
  setActiveId: (v: string | null) => void
  theme?:      'light' | 'dark'
  onClick?:    () => void
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
      <nav
        className="pointer-events-auto flex items-center justify-between px-6 py-4"
        style={{
          width:                'min(90vw, 500px)',
          background:           'rgba(10,10,10,0.90)',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:               '1px solid rgba(240,240,240,0.08)',
          borderRadius:         '20px',
        }}
      >
        {/* Left: Let's talk → opens ContactModal */}
        <button
          onClick={openContact}
          className="text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'rgba(240,240,240,0.38)', transition: 'color 0.2s ease', background: 'none', border: 'none', cursor: 'none', padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.38)'; setCursorType('default') }}
        >
          Let&apos;s talk
        </button>

        {/* Center: logo */}
        <Link
          href="/"
          aria-label="Home"
          style={{ color: 'rgba(240,240,240,0.55)', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.55)'; setCursorType('default') }}
        >
          <LogoMark />
        </Link>

        {/* Right: Menu toggle — hover to open */}
        <button
          className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'rgba(240,240,240,0.38)', transition: 'color 0.2s ease' }}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onMouseEnter={(e) => { cancelMenuClose(); open(); e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { scheduleMenuClose(close); e.currentTarget.style.color = 'rgba(240,240,240,0.38)'; setCursorType('default') }}
        >
          Menu
          <span className="flex flex-col gap-[4px]" aria-hidden="true">
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
      // Mobile: always show sticky — no room for the full horizontal nav
      if (window.innerWidth < 768) { setScrolled(true); return }
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
